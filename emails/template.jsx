import React from "react";

export default function EmailTemplate({ userName, type, data }) {
  if (type === "monthly-report") {
    return (
      <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <h1 style={{ color: "#333" }}>Monthly Financial Report</h1>
        <p>Hi {userName},</p>
        <p>Here is your financial summary for {data?.month}:</p>

        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <p>
            <strong>Total Income:</strong> ${data?.stats?.totalIncome}
          </p>
          <p>
            <strong>Total Expenses:</strong> ${data?.stats?.totalExpenses}
          </p>
        </div>

        {data?.insights && data.insights.length > 0 && (
          <div>
            <h3 style={{ color: "#555" }}>AI Insights</h3>
            <ul>
              {data.insights.map((insight, index) => (
                <li key={index} style={{ marginBottom: "10px" }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p style={{ marginTop: "20px", color: "#888", fontSize: "12px" }}>
          This is an automated message from FinanceGuru.
        </p>
      </div>
    );
  }

  if (type === "budget-alert") {
    return (
      <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <h1 style={{ color: "#d9534f" }}>Budget Alert</h1>
        <p>Hi {userName},</p>
        <p>
          You have reached <strong>{Number(data?.percentageUsed).toFixed(1)}%</strong> of your
          monthly budget for <strong>{data?.accountName}</strong>.
        </p>
        
        <div
          style={{
            backgroundColor: "#fdf0f0",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <p>
            <strong>Total Expenses:</strong> ${data?.totalExpenses}
          </p>
          <p>
            <strong>Budget Amount:</strong> ${data?.budgetAmount}
          </p>
        </div>

        <p>Please review your spending to stay within your limits.</p>

        <p style={{ marginTop: "20px", color: "#888", fontSize: "12px" }}>
          This is an automated message from FinanceGuru.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <p>Hello {userName},</p>
      <p>You have a new notification from FinanceGuru.</p>
    </div>
  );
}
