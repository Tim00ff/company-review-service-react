import { useEffect, useState } from 'react';
import { store } from '../mockBackend/Store';

export const AdminPanel = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    store.getManagerApplications().then(setApplications);
  }, []);

  const handleApprove = async (applicationId) => {
    await store.approveManager(applicationId);
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
            <p>Email: {app.email}</p>
            <button onClick={() => handleApprove(app.id)}>Approve</button>
          </div>
        ))}
      </div>
    </div>
  );
};