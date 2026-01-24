import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AlumniPage = () => {
  const { batch } = useParams(); // Get the batch name from the URL
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/alumni/${batch}`);
        setAlumni(response.data);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      }
    };

    fetchAlumni();
  }, [batch]);

  const styles = {
    body: { margin: 0, fontFamily: "Arial, sans-serif", backgroundColor: "#ece7e2" },
    header: { backgroundColor: "#4a7766", color: "white", padding: "20px", textAlign: "center", fontSize: "24px" },
    container: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", padding: "20px" },
    card: { backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", textAlign: "center", padding: "20px" },
    image: { width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" },
    name: { margin: "10px 0 5px", fontSize: "18px" },
    text: { margin: "5px 0", fontSize: "14px", color: "#555" },
    links: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" },
    linkIcon: { width: "24px", height: "24px" },
  };

  return (
    <div style={styles.body}>
      <header style={styles.header}>Alumni Directory - Batch: {batch}</header>
      <div style={styles.container}>
        {alumni.length > 0 ? (
          alumni.map((alumnus) => (
            <div key={alumnus._id} style={styles.card}>
              <img src={alumnus.photo || "https://via.placeholder.com/100"} alt={`${alumnus.username}'s Photo`} style={styles.image} />
              <h3 style={styles.name}>{alumnus.username}</h3>
              <p style={styles.text}>{alumnus.email}</p>
              <div style={styles.links}>
                {alumnus.linkedin && (
                  <a href={alumnus.linkedin} target="_blank" rel="noopener noreferrer">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" style={styles.linkIcon} />
                  </a>
                )}
                {alumnus.github && (
                  <a href={alumnus.github} target="_blank" rel="noopener noreferrer">
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" style={styles.linkIcon} />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p>No alumni found for this batch.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniPage;