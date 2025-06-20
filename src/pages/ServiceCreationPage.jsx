import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { store } from '../mockBackend/Store';
import styles from './ServiceCreationPage.module.css';

export const ServiceCreationPage = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    sections: [{ title: '', content: '', image: null }],
    tags: '',
    preview: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serviceOwner, setServiceOwner] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await store.getCurrentUser();
      if (!user || user.role !== 'manager') {
        navigate('/');
        return;
      }
      setCurrentUser(user);
    };
    loadUser();
  }, [navigate]);

  // Load service data if we're in edit mode
  useEffect(() => {
    const loadService = async () => {
      if (serviceId) {
        setIsEditing(true);
        const service = await store.getService(serviceId);
        if (service) {
          
          if (service.userId !== currentUser?.id) {
            alert('You are not authorized to edit this service');
            navigate('/manager-dashboard');
            return;
          }
          
          
          const owner = store.data.users.find(u => u.id === service.userId);
          setServiceOwner(owner);
          
          
          const sections = service.sections.map((section, index) => ({
            title: section.title,
            content: section.content,
            image: service.images[index] || null
          }));
          
          setFormData({
            sections,
            tags: service.tags.join(' '),
            preview: false
          });
        }
      }
    };
    
    if (currentUser && serviceId) {
      loadService();
    }
  }, [serviceId, currentUser, navigate]);

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', content: '', image: null }]
    });
  };

  const removeSection = (index) => {
    if (formData.sections.length <= 1) return;
    const newSections = [...formData.sections];
    newSections.splice(index, 1);
    setFormData({ ...formData, sections: newSections });
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSectionChange(index, 'image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.companyId) return;
    
    setIsSubmitting(true);
    try {
      const serviceData = {
        sections: formData.sections.map(section => ({
          title: section.title,
          content: section.content
        })),
        images: formData.sections.map(section => section.image || ''),
        tags: formData.tags,
        companyId: currentUser.companyId,
        userId: currentUser.id  // Track the creator
      };
      
      if (isEditing) {
        await store.updateService(serviceId, serviceData);
      } else {
        await store.createServicePost(serviceData);
      }
      
      navigate('/manager-dashboard');
    } catch (error) {
      alert(`Error ${isEditing ? 'updating' : 'creating'} service: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Service' : 'Create New Service'}</h1>
        {isEditing && serviceOwner && (
          <div className={styles.ownerInfo}>
            <span>Created by: {serviceOwner.email}</span>
          </div>
        )}
      </div>
      
      <div className={styles.togglePreview}>
        <button
          type="button"
          onClick={() => setFormData({...formData, preview: !formData.preview})}
          className={formData.preview ? styles.activeButton : ''}
        >
          {formData.preview ? 'Edit Mode' : 'Preview Mode'}
        </button>
      </div>

      {formData.preview ? (
        <div className={styles.previewContainer}>
          <h2>Preview</h2>
          {formData.sections.map((section, index) => (
            <div key={index} className={styles.previewSection}>
              <h3>{section.title || 'Untitled Section'}</h3>
              <p>{section.content || 'Content will appear here...'}</p>
              {section.image && (
                <img 
                  src={section.image} 
                  alt={`Preview ${index + 1}`} 
                  className={styles.previewImage}
                />
              )}
            </div>
          ))}
          <div className={styles.tagsPreview}>
            Tags: {formData.tags.split(' ').filter(tag => tag).map(tag => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {formData.sections.map((section, index) => (
            <div key={index} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3>Section {index + 1}</h3>
                {formData.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>Section Title</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                  placeholder="Enter section title"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Content</label>
                <textarea
                  value={section.content}
                  onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                  placeholder="Describe this section..."
                  rows={5}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Image (Optional)</label>
                {section.image ? (
                  <div className={styles.imagePreview}>
                    <img src={section.image} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      onClick={() => handleSectionChange(index, 'image', null)}
                      className={styles.removeImage}
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addSection}
            className={styles.addSectionButton}
          >
            + Add Another Section
          </button>
          
          <div className={styles.formGroup}>
            <label>Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="Enter relevant keywords separated by spaces"
            />
            <small>Example: "web-design seo digital-marketing"</small>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Service'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ServiceCreationPage;