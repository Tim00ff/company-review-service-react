import { useEffect, useState } from 'react';
import { store } from '../mockBackend/Store';
import './AdminPanel.css';

export const AdminPanel = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    store.getManagerApplications().then(setApplications);
  }, []);

  const handleApprove = async (applicationId) => {
    await store.approveManager(applicationId);
    setApplications(prev => prev.filter(app => app.id !== applicationId));
  };

  const handleReject = async (applicationId) => {
    await store.rejectManager(applicationId);
    setApplications(prev => prev.filter(app => app.id !== applicationId));
  };

  return (
    <div className="admin-panel">
      <h2>Manager Applications ({applications.length})</h2>
      <div className="applications-list">
        {applications.map(app => (
          <div key={app.id} className="application-card">
            <h3>{app.companyName}</h3>
            <p>Manager: {app.managerName}</p>
            <p>Company: {app.companyName}</p>
            <p>Email: {app.email}</p>
            <div className="button-group">
              <button className="approve-btn" onClick={() => handleApprove(app.id)}>
                Approve
              </button>
              <button className="reject-btn" onClick={() => handleReject(app.id)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};