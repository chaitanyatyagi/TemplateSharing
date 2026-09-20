import { useEffect, useState } from "react"
import Table from "../../components/Table"
import { getAllUsers } from "../../api/admin";

const UserData = () => {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const response = await getAllUsers();

        if (response.status === "Success") {
          const cols = ["DATE", "NAME", "EMAIL", "MEMBERSHIP", "REORDER"];

          const userData = (response.users || []).map((user) => ({
            DATE: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-",
            NAME: user.name || "-",
            EMAIL: user.email || "-",
            MEMBERSHIP: user.role === "admin" ? "Admin" : "Basic Member",
            REORDER: user.reordered ? "Yes" : "No",
          }));

          setHeaders(cols);
          setData(userData);
        } else {
          setError(response.message || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  return (
  <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
    {/* ======= Header Row (Recent UserDatas Section) ======= */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 shadow-sm p-4 rounded-md bg-white">
      <p className="text-textMuted font-inter font-semibold text-base mb-2 sm:mb-0">
        User's Data
      </p>
    </div>

    {error && (
      <div className="mt-4 p-3 bg-redAccent/10 text-redAccent rounded-md text-sm">{error}</div>
    )}

    {/* ======= Responsive Table ======= */}
    <div className="mt-4">
      <Table headers={headers} data={data} />
    </div>
  </div>
);
}

export default UserData;
