const HRDashboard = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">HR Dashboard</h1>
        <p className="page-subtitle">Overview of employee management</p>
      </div>

      <div className="card">
        <div className="card-body text-center">
          <h2>👥 HR Dashboard</h2>
          <p>Welcome to the HR management portal.</p>
          <p>Use the sidebar to navigate to different sections:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Employee Profiles - View and manage employee information</li>
            <li>Visa Management - Review visa documents and status</li>
            <li>Hiring Management - Generate tokens and review applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard; 