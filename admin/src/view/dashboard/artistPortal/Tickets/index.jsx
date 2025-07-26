import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryMap, setSummaryMap] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/getTicketSummaries")
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setTickets(res.data.data);
        } else {
          setTickets([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching tickets:", err);
        setTickets([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSummaryChange = (ticketNumber, value) => {
    setSummaryMap((prev) => ({
      ...prev,
      [ticketNumber]: value,
    }));
  };

  const handleResolve = (ticketNumber) => {
    const summary = summaryMap[ticketNumber];
    if (!summary) return alert("Please write a summary before submitting.");

    axios
      .post("http://localhost:5000/resolveTicket", {
        ticketNumber,
        notes: summary,
      })
      .then(() => {
        alert("Ticket marked as resolved.");
      })
      .catch((err) => {
        console.error("Error resolving ticket:", err);
        alert("Failed to mark as resolved.");
      });
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        🎫 Admin Ticket Inbox
      </h2>

      {loading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        tickets.map((ticket) => {
          let imageUrls = [];

          try {
            imageUrls = JSON.parse(ticket.imageURL);
          } catch (e) {
            imageUrls = [];
          }

          return (
            <div key={ticket.ticketNumber} style={cardStyle}>
              {/* Images */}
              {imageUrls.length > 0 && (
                <div style={imageWrapperStyle}>
                  {imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`attachment-${index}`}
                      style={imageStyle}
                    />
                  ))}
                </div>
              )}

              {/* Ticket Info */}
              <div style={contentStyle}>
                <p>
                  <strong>ophID #:</strong> {ticket.ophID}
                </p>
                <p>
                  <strong>Ticket #:</strong> {ticket.ticketNumber}
                </p>
                <p>
                  <strong>Name:</strong> {ticket.name}
                </p>
                <p>
                  <strong>Email:</strong> {ticket.email}
                </p>
                <p>
                  <strong>Subject:</strong> {ticket.subject}
                </p>
                <p>
                  <strong>Description:</strong> {ticket.description}
                </p>
                <p>
                  <strong>Category:</strong> {ticket.category}
                </p>

                <a
                  href={`mailto:${ticket.email}?subject=${encodeURIComponent(
                    `Ticket #${ticket.ticketNumber} - ${ticket.subject}`
                  )}&body=${encodeURIComponent(
                    `Hi ${ticket.name},\n\nThank you for contacting us.\n\n`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <button style={replyButtonStyle}>Reply via Email</button>
                </a>
                <div style={{ marginTop: "1rem" }}>
                  <label htmlFor={`summary-${ticket.ticketNumber}`}>
                    <strong>Resolution Summary:</strong>
                  </label>
                  <textarea
                    id={`summary-${ticket.ticketNumber}`}
                    rows={3}
                    value={summaryMap[ticket.ticketNumber] || ""}
                    onChange={(e) =>
                      handleSummaryChange(ticket.ticketNumber, e.target.value)
                    }
                    placeholder="Write resolution summary here..."
                    style={{
                      width: "100%",
                      marginTop: "5px",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      color: "#000", // explicitly black
                    }}
                  ></textarea>
                  <button
                    style={{
                      ...replyButtonStyle,
                      backgroundColor: "green",
                      marginTop: "8px",
                    }}
                    onClick={() => handleResolve(ticket.ticketNumber)}
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: "1000px",
  margin: "2rem auto",
  padding: "1rem",
};

const cardStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "1rem",
  marginBottom: "1.5rem",
  backgroundColor: "#fff",
  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
};

const imageWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginRight: "1.5rem",
  width: "150px",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  objectFit: "cover",
  borderRadius: "8px",
};

const contentStyle = {
  flex: 1,
};

const replyButtonStyle = {
  marginTop: "10px",
  padding: "8px 14px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};
