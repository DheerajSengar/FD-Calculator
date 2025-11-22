import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";
import "./App.css";


ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

function formatRupees(num) {
  return (
    "₹ " +
    num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })
  );
}

function App() {
  const [investment, setInvestment] = useState(673340);
  const [rate, setRate] = useState(1); // %
  const [years, setYears] = useState(2);
  const [months, setMonths] = useState(1);
  const [compound, setCompound] = useState(12); // monthly

  const [totalInterest, setTotalInterest] = useState(0);
  const [maturityAmount, setMaturityAmount] = useState(0);

  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);


  const totalMonths = years * 12 + months;
  const timeLabel = (() => {
    if (!years && !months) return "0 months";
    let txt = "";
    if (years) txt += `${years} ${years === 1 ? "year" : "years"} `;
    if (months) txt += `${months} ${months === 1 ? "month" : "months"}`;
    return txt.trim();
  })();


  useEffect(() => {
    const ctx = chartCanvasRef.current;
    if (!ctx) return;


    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: ["Total Interest", "Total Investment"],
        datasets: [
          {
            data: [0, 0],
            borderWidth: 0,
            cutout: "70%",
            backgroundColor: ["#4f46e5", "#c7d2fe"],
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || "";
                const value = ctx.parsed;
                return `${label}: ${formatRupees(value)}`;
              },
            },
          },
        },
        maintainAspectRatio: false,
      },
    });


    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);


  const updateChart = (principal, interest) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    chart.data.datasets[0].data = [interest, principal];
    chart.update();
  };


  useEffect(() => {
    if (investment <= 0 || rate <= 0 || (years === 0 && months === 0)) {
      setTotalInterest(0);
      setMaturityAmount(0);
      updateChart(0, 0);
      return;
    }

    const r = rate / 100;
    const t = years + months / 12;
    const n = compound;


    const A = investment * Math.pow(1 + r / n, n * t);
    const interest = A - investment;

    setTotalInterest(interest);
    setMaturityAmount(A);
    updateChart(investment, interest);
  }, [investment, rate, years, months, compound]);


  const handleTimeRangeChange = (e) => {
    const total = parseInt(e.target.value, 10);
    const y = Math.floor(total / 12);
    const m = total % 12;
    setYears(y);
    setMonths(m);
  };

  const currentTimeRangeValue = Math.min(Math.max(totalMonths, 1), 120);

  return (
    <div className="app-wrapper">
      <h1>Plan Your Financials: FD Calculator</h1>

      <div className="calculator-container">

        <div className="left-panel card">

          <div className="field-group">
            <div className="field-header">
              <label htmlFor="investmentInput">Total Investment</label>
              <div className="inline-input">
                <span>₹</span>
                <input
                  id="investmentInput"
                  type="number"
                  value={investment}
                  onChange={(e) =>
                    setInvestment(Number(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="1000"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
            />
          </div>


          <div className="field-group">
            <div className="field-header">
              <label htmlFor="rateInput">Rate of interest (p.a)</label>
              <div className="inline-input">
                <input
                  id="rateInput"
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value) || 0)}
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>


          <div className="field-group">
            <label>Time Period</label>
            <div className="time-inputs">
              <div className="inline-input">
                <input
                  type="number"
                  min="0"
                  value={years}
                  onChange={(e) =>
                    setYears(Math.max(0, Number(e.target.value) || 0))
                  }
                />
                <span>Years</span>
              </div>
              <div className="inline-input">
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={months}
                  onChange={(e) =>
                    setMonths(
                      Math.min(
                        11,
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    )
                  }
                />
                <span>Months</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="120"
              value={currentTimeRangeValue}
              onChange={handleTimeRangeChange}
            />
            <small id="timeLabel">{timeLabel}</small>
          </div>


          <div className="field-group">
            <label htmlFor="compoundSelect">Compounding Period</label>
            <select
              id="compoundSelect"
              value={compound}
              onChange={(e) => setCompound(Number(e.target.value))}
            >
              <option value={1}>Yearly</option>
              <option value={2}>Half-Yearly</option>
              <option value={4}>Quarterly</option>
              <option value={12}>Monthly</option>
            </select>
          </div>


          <div className="summary-row">
            <div className="summary-card">
              <p>Total Interest</p>
              <h2>{formatRupees(totalInterest)}</h2>
            </div>
            <div className="summary-card">
              <p>Total Investment</p>
              <h2>{formatRupees(investment)}</h2>
            </div>
            <div className="summary-card">
              <p>Total Maturity Amount</p>
              <h2>{formatRupees(maturityAmount)}</h2>
            </div>
          </div>
        </div>


        <div className="right-panel card">
          <h2>Total Maturity Amount</h2>
          <p className="maturity-center">{formatRupees(maturityAmount)}</p>

          <canvas
            ref={chartCanvasRef}
            style={{ width: "100%", height: "300px" }}
          />

          <div className="legend">
            <div className="legend-item">
              <span className="legend-box legend-interest" /> Total Interest
            </div>
            <div className="legend-item">
              <span className="legend-box legend-investment" /> Total
              Investment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
