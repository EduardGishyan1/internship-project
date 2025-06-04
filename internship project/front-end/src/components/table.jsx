import { useEffect, useState } from "react";
import "./table.css";

const Table = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [counter, setCounter] = useState(100);

  useEffect(() => {
    if (counter < 0) return;
    const timer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [counter]);

  useEffect(() => {
    fetch("http://localhost:3002/finnhub/quotes")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => {
        console.error("Error fetching data");
        setError("Could not load stock data.");
      });
  }, []);

  return (
    <>
      <div className="header">
        <h1 className="logo">Stock Market</h1>
        {counter > 0 ? (
          <p>Refreshing in: {counter}s</p>
        ) : (
          <button className="reloadButton" onClick={() => window.location.reload()}>Reload Page</button>
        )}
      </div>

      <div className="mainDiv">
        <div className="table-container">
          {error ? (
            <div className="error">{error}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Company name</th>
                  <th>Current price</th>
                  <th>High price</th>
                  <th>Low price</th>
                  <th>Open price</th>
                  <th>Timestamp</th>
                  <th>Price Difference</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="7">Loading...</td>
                  </tr>
                ) : (
                  data.map((stock, i) => (
                    <tr key={i}>
                      <td>{stock.symbol}</td>
                      <td>${stock.currentPrice?.toFixed(2)}</td>
                      <td>${stock.highPrice?.toFixed(2)}</td>
                      <td>${stock.lowPrice?.toFixed(2)}</td>
                      <td>${stock.openPrice?.toFixed(2)}</td>
                      <td>
                        {stock.timestamp
                          ? new Date(stock.timestamp * 1000).toLocaleString()
                          : "-"}
                      </td>
                        <td>
                            ${stock.priceDifference}
                        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Table;
