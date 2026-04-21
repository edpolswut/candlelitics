import './Dashboard.css';

function Dashboard({ data }) {
  return (
    <div className="dashboard">
      <h1>{data.title}</h1>
    </div>
  );
}

export default Dashboard;