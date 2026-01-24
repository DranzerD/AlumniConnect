import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BatchList.css'; // Ensure you have the appropriate CSS styles

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/batches');
        const data = response.data;

        // Assuming your API returns an array of objects with 'years' and 'strength' properties
        setBatches(data.reverse()); // Most recent batches first
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    fetchBatches();
  }, []);

  return (
    <div className="batch-list-container">
      <h1 className="batch-list-header">Networking - Select Your Batch</h1>
      <div className="batch-list">
        {batches.map((batch) => (
          <div
            key={batch.id} 
            className="batch-card"
            onClick={() => navigate(`/alumni/${batch.years}`, { state: batch.members })}
          >
            <h2>Batch: {batch.years}</h2>
            <p>Strength: {batch.strength}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchList;