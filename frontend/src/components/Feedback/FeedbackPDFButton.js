import React, { useState } from "react";
import { downloadFeedbackPDF, getFeedbackReportData } from "../../api/feedbackApi";

const FeedbackPDFButton = ({ userRole }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (userRole !== "admin") {
    return null;
  }

  const handleDownload = async () => {
    setLoading(true);
    try {
      console.log("Starting PDF download...");
      await downloadFeedbackPDF();
      alert("Report downloaded successfully!");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (showPreview) {
      setShowPreview(false);
      setReportData(null);
      return;
    }

    setLoading(true);
    try {
      console.log("Loading preview data...");
      const data = await getFeedbackReportData();
      setReportData(data);
      setShowPreview(true);
      console.log("Preview data loaded");
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      alert("Failed to load preview: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!reportData || !showPreview) return null;

    const { summary, feedbacks } = reportData;

    return (
      <div style={{
        marginTop: "20px",
        padding: "20px",
        border: "3px solid #E8D4C0",
        borderRadius: "12px",
        backgroundColor: "white",
        maxHeight: "500px",
        overflowY: "auto"
      }}>
        <h3 style={{ color: "#8B4513", marginBottom: "15px" }}>Report Preview</h3>
        
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div style={{ backgroundColor: "#F5DEB3", padding: "15px", borderRadius: "8px", border: "2px solid #E8D4C0" }}>
              <h4 style={{ margin: "0 0 5px 0", color: "#8B4513" }}>Total Feedbacks</h4>
              <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{summary?.total || 0}</p>
            </div>
            
            <div style={{ backgroundColor: "#E8D4C0", padding: "15px", borderRadius: "8px", border: "2px solid #B8764F" }}>
              <h4 style={{ margin: "0 0 5px 0", color: "#8B4513" }}>Average Rating</h4>
              <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
                {summary?.averageRating || 0}/5.0
              </p>
            </div>
            
            <div style={{ backgroundColor: "#d1eddd", padding: "15px", borderRadius: "8px", border: "2px solid #28a745" }}>
              <h4 style={{ margin: "0 0 5px 0", color: "#388e3c" }}>Total Helpful Votes</h4>
              <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
                {summary?.totalHelpfulVotes || 0}
              </p>
            </div>
          </div>
          
          <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            <strong>Generated:</strong> {new Date(reportData.generatedAt).toLocaleString()}
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#8B4513", marginBottom: "10px" }}>Ratings Breakdown:</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
            {[5, 4, 3, 2, 1].map(rating => {
              const count = summary?.ratings?.[rating] || 0;
              const percentage = summary?.total > 0 ? Math.round((count / summary.total) * 100) : 0;
              const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
              return (
                <div key={rating} style={{ 
                  backgroundColor: rating >= 4 ? "#d1eddd" : rating >= 3 ? "#F5DEB3" : "#ffebee",
                  padding: "10px", 
                  borderRadius: "6px",
                  textAlign: "center",
                  border: "2px solid " + (rating >= 4 ? "#28a745" : rating >= 3 ? "#B8764F" : "#dc3545")
                }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                    {stars}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", margin: "5px 0" }}>
                    {count}
                  </div>
                  <div style={{ fontSize: "10px", color: "#666" }}>
                    ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#8B4513", marginBottom: "10px" }}>Categories Breakdown:</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px" }}>
            {['product', 'service', 'delivery', 'website', 'general'].map(category => {
              const count = summary?.categories?.[category] || 0;
              const icons = { product: "🎨", service: "🛠️", delivery: "🚚", website: "🌐", general: "📋" };
              return (
                <div key={category} style={{ 
                  backgroundColor: "#F5DEB3",
                  padding: "8px", 
                  borderRadius: "6px",
                  textAlign: "center",
                  border: "2px solid #E8D4C0"
                }}>
                  <div style={{ fontSize: "16px", marginBottom: "2px" }}>
                    {icons[category]}
                  </div>
                  <div style={{ fontSize: "10px", textTransform: "capitalize", fontWeight: "bold", color: "#8B4513" }}>
                    {category}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ color: "#8B4513", marginBottom: "10px" }}>Recent Feedbacks Sample:</h4>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {feedbacks?.slice(0, 5).map((feedback, index) => (
              <div key={index} style={{
                backgroundColor: "white",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "2px solid #E8D4C0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#8B4513" }}>{feedback.customerName}</strong>
                    <span style={{ 
                      marginLeft: "10px",
                      padding: "2px 6px",
                      backgroundColor: "#F5DEB3",
                      borderRadius: "3px",
                      fontSize: "10px",
                      textTransform: "capitalize",
                      color: "#8B4513"
                    }}>
                      {feedback.category}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#B8764F" }}>
                      {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666" }}>
                      Votes: {feedback.helpfulVotes || 0}
                    </div>
                  </div>
                </div>
                <p style={{ 
                  margin: "5px 0 0 0", 
                  fontSize: "12px", 
                  color: "#555",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  "{feedback.message}"
                </p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ 
          fontSize: "12px", 
          color: "#8B4513", 
          fontStyle: "italic",
          marginTop: "15px",
          textAlign: "center",
          padding: "10px",
          backgroundColor: "#F5DEB3",
          borderRadius: "8px"
        }}>
          This is a summary preview. Download the full report for detailed feedback content and comprehensive analytics.
        </p>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: "20px", 
      border: "3px solid #E8D4C0", 
      borderRadius: "12px", 
      backgroundColor: "white",
      marginBottom: "20px"
    }}>
      <h3 style={{ color: "#8B4513", marginBottom: "15px" }}>
        Admin Tools - PDF Reports
      </h3>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#cccccc" : "transparent",
            background: loading ? "#cccccc" : "linear-gradient(45deg, #B8764F, #8B4513)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: loading ? "none" : "0 4px 12px rgba(184, 118, 79, 0.3)"
          }}
        >
          {loading ? (
            <>
              <span style={{ 
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #ffffff",
                borderRadius: "50%",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite"
              }}></span>
              Generating...
            </>
          ) : (
            <>
              📄 Download Full Report
            </>
          )}
        </button>
        
        <button
          onClick={handlePreview}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#cccccc" : "transparent",
            background: loading ? "#cccccc" : "linear-gradient(45deg, #E8D4C0, #F5DEB3)",
            color: "#8B4513",
            border: "2px solid #B8764F",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {loading ? (
            <>
              <span style={{ 
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #8B4513",
                borderRadius: "50%",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite"
              }}></span>
              Loading...
            </>
          ) : showPreview ? (
            <>
              Hide Preview
            </>
          ) : (
            <>
              👁️ Show Preview
            </>
          )}
        </button>
      </div>

      <p style={{ 
        fontSize: "12px", 
        color: "#666", 
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: "#F5DEB3",
        borderRadius: "6px"
      }}>
        Generate comprehensive feedback reports with analytics, ratings breakdown, and detailed customer insights. Perfect for business analysis and customer satisfaction tracking.
      </p>

      {renderPreview()}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FeedbackPDFButton;