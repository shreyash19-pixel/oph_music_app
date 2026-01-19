import React, { useEffect, useState } from "react";
import axiosApi from "../../../../conf/axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
// import { useArtist } from "../../../../../../frontend/src/pages/auth/API/ArtistContext";

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([]);
   const { ticketNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [summaryMap, setSummaryMap] = useState({});
  // const { ophid, headers } = useArtist(); 

  useEffect(() => {
    axiosApi
      .get(`/getTicket?ticketNumber=${ticketNumber}`)
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
    if (!summary) return toast.error("Please write a summary before submitting.");

    const ticket = tickets.find(t => t.ticketNumber === ticketNumber);
    if (!ticket) return toast.error("Ticket not found.");

    console.log("Resolving ticket:", { ticketNumber, ophID: ticket.ophID, summary });

    axiosApi
      .post("/resolveTicket", {
        ticketNumber,
        notes: summary,
        ophID: ticket.ophID,
      })
      .then(() => {
        toast.success("Ticket marked as resolved.");
      })
      .catch((err) => {
        console.error("Error resolving ticket:", err);
        toast.error("Failed to mark as resolved.");
      });
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>
        🎫 Resolved Ticket Details
      </h2>

      {loading ? (
        <p style={loadingStyle}>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p style={emptyStyle}>No tickets found.</p>
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

              <div style={contentStyle}>
                <div style={badgeContainerStyle}>
                  <span style={badgeStyle}>#{ticket.ticketNumber}</span>
                  <span style={resolvedBadgeStyle}>✓ Resolved</span>
                </div>
                
                <div style={infoRowStyle}>
                  <span style={labelStyle}>OPH ID:</span>
                  <span style={valueStyle}>{ticket.ophID}</span>
                </div>
                
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Name:</span>
                  <span style={valueStyle}>{ticket.name}</span>
                </div>
                
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Email:</span>
                  <span style={valueStyle}>{ticket.email}</span>
                </div>
                
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Category:</span>
                  <span style={categoryBadgeStyle}>{ticket.category}</span>
                </div>
                
                <div style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Subject</h3>
                  <p style={textStyle}>{ticket.subject}</p>
                </div>
                
                <div style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Description</h3>
                  <p style={textStyle}>{ticket.description}</p>
                </div>
                
                <div style={notesSectionStyle}>
                  <h3 style={notesTitleStyle}>Resolution Notes</h3>
                  <p style={notesTextStyle}>{ticket.notes}</p>
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
  maxWidth: "1200px",
  margin: "2rem auto",
  padding: "2rem",
  backgroundColor: "none",
  minHeight: "100vh",
};

const headerStyle = {
  fontSize: "2.5rem",       
  fontWeight: "700",
  color: "#1f2937",
  marginBottom: "2rem",
};

const loadingStyle = {
  color: "#4b5563",
  fontSize: "1.2rem",
};

const emptyStyle = {
  color: "#4b5563",
  fontSize: "1.2rem",
};

const cardStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: "2rem",
  background: "#fff",
  borderRadius: "16px",
  padding: "2rem",
  marginBottom: "2rem",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  transition: "transform 0.2s",
};

const imageWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minWidth: "200px",
};

const imageStyle = {
  width: "200px",
  height: "200px",
  objectFit: "cover",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const contentStyle = {
  flex: 1,
};

const badgeContainerStyle = {
  display: "flex",
  gap: "1rem",
  marginBottom: "1.5rem",
};

const badgeStyle = {
  backgroundColor: "#667eea",
  color: "#fff",
  padding: "0.5rem 1rem",
  borderRadius: "20px",
  fontSize: "0.9rem",
  fontWeight: "600",
};

const resolvedBadgeStyle = {
  background: "#10b981",
  color: "#fff",
  padding: "0.5rem 1rem",
  borderRadius: "20px",
  fontSize: "0.9rem",
  fontWeight: "600",
};

const infoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.75rem",
};

const labelStyle = {
  fontWeight: "600",
  color: "#6b7280",
  minWidth: "100px",
};

const valueStyle = {
  color: "#1f2937",
  fontSize: "1rem",
};

const categoryBadgeStyle = {
  background: "#f3f4f6",
  color: "#4b5563",
  padding: "0.25rem 0.75rem",
  borderRadius: "12px",
  fontSize: "0.875rem",
  fontWeight: "500",
};

const sectionStyle = {
  marginTop: "1.5rem",
  paddingTop: "1.5rem",
  borderTop: "1px solid #e5e7eb",
};

const sectionTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "0.5rem",
};

const textStyle = {
  color: "#4b5563",
  lineHeight: "1.6",
};

const notesSectionStyle = {
  marginTop: "1.5rem",
  padding: "1.5rem",
  background: "#f0fdf4",
  borderRadius: "12px",
  border: "1px solid #86efac",
};

const notesTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#166534",
  marginBottom: "0.75rem",
};

const notesTextStyle = {
  color: "#15803d",
  lineHeight: "1.6",
  fontWeight: "500",
};
