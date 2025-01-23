// components/Dashboard.js
import React from "react";
//test

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-200 p-4">
          <h1 className="text-2xl font-bold">DASHBORD</h1>
        </div>
        <div className="flex border-b">
          <button className="flex-1 py-2 px-4 bg-black text-white">
            Document
          </button>
          <button className="flex-1 py-2 px-4 text-gray-400" disabled>
            EMI
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-6 gap-4 mb-4">
            {["PUC", "INSURANCE", "FITNESS", "PERMIT", "TAX"].map((item) => (
              <div key={item} className="col-span-1 text-center">
                <div className="text-lg font-bold">{item}</div>
                <div className="text-red-500 text-xl">0</div>
              </div>
            ))}
          </div>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                {[
                  "SR No",
                  "Master No.",
                  "Vehicle No.",
                  "Alert Date",
                  "Expire Date",
                  "Action",
                ].map((header) => (
                  <th key={header} className="border border-gray-200 p-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan="6"
                  className="border border-gray-200 p-2 text-center"
                >
                  No Data Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
