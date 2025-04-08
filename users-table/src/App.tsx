import UsersTable from "./components/UsersTable";
import mockUsers from "./data/mockUsers";
import "./theme.css";

function App() {
  return (
    <div style={{ padding: "1rem" }}>
      <UsersTable users={mockUsers} defaultPageSize={10} />
    </div>
  );
}

export default App;
