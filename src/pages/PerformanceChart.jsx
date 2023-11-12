import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import 'chartjs-adapter-date-fns';

const PerformanceChart = (props) => {
  const chartRef = useRef(null);
  const charInstance = useRef(null);

  useEffect(() => {
    if (charInstance.current) {
      charInstance.current.destroy();
    }
    const myChartRef = chartRef.current.getContext("2d");

    charInstance.current = new Chart(myChartRef, {
      type: "line",
      data: {
        labels: props.timeData,
        datasets: [
          {
            label: `${props.name}'s Rank`,
            data: props.rankData,
            borderColor: "gray",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        }
      },
    });
    return () => {
      if (charInstance.current) {
        charInstance.current.destroy();
      }
    };
  }, [props.timeData, props.rankData]);

  return (
    <div className="bg-white rounded-md p-10 h-300px w-400px md:h-500px md:w-900px">
    <canvas ref={chartRef} className="w-full h-full"></canvas>
  </div>
  );
};

export default PerformanceChart;
