import React from 'react';
import { useParams } from 'react-router-dom';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Patient Detail</h1>
      <p>Patient ID: {id}</p>
      <p>Patient details and chat UI will go here.</p>
    </div>
  );
};

export default PatientDetailPage;
