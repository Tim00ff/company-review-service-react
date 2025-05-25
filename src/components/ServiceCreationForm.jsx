import { useState } from 'react';
import { store } from '../mockBackend/Store';

export const ServiceCreationForm = ({ companyId }) => {
  const [formData, setFormData] = useState({
    sections: [{ title: '', content: '' }],
    images: [],
    tags: ''
  });

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', content: '' }]
    });
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImages = [...formData.images];
      newImages[index] = e.target.result;
      setFormData({ ...formData, images: newImages });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await store.createServicePost({
      ...formData,
      companyId
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {formData.sections.map((section, index) => (
        <div key={index} className="section-form">
          <input
            placeholder="Section Title"
            value={section.title}
            onChange={e => {
              const newSections = [...formData.sections];
              newSections[index].title = e.target.value;
              setFormData({ ...formData, sections: newSections });
            }}
          />
          <textarea
            placeholder="Content"
            value={section.content}
            onChange={e => {
              const newSections = [...formData.sections];
              newSections[index].content = e.target.value;
              setFormData({ ...formData, sections: newSections });
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, index)}
          />
        </div>
      ))}
      
      <button type="button" onClick={addSection}>Add Section</button>
      <input
        placeholder="Tags (space separated)"
        value={formData.tags}
        onChange={e => setFormData({ ...formData, tags: e.target.value })}
      />
      <button type="submit">Publish Service</button>
    </form>
  );
};