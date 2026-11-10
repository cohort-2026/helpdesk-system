
import { useMemo, useState } from "react";

type MemberRole = "Agent" | "Employee";

type Member = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
  dateJoined: string;
};

type TeamAgentsProps = {
  currentUserRole?: "Department Lead" | "System Admin" | "Agent" | "Employee";
};

// Temporary sample data
const initialMembers: Member[] = [
  {
    id: 1,
    name: "Lindiwe Dube",
    email: "lindiwe@example.com",
    role: "Agent",
    dateJoined: "12 Aug 2026",
  },
  {
    id: 2,
    name: "Thabo Mokoena",
    email: "thabo@example.com",
    role: "Employee",
    dateJoined: "15 Aug 2026",
  },
  {
    id: 3,
    name: "Sarah Nkosi",
    email: "sarah@example.com",
    role: "Employee",
    dateJoined: "20 Aug 2026",
  },
];

const TeamAgents = ({
  currentUserRole = "Department Lead",
}: TeamAgentsProps) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canRemoveMembers =
    currentUserRole === "Department Lead" ||
    currentUserRole === "System Admin";

  // Calculate team statistics
  const totalMembers = members.length;

  const totalAgents = members.filter(
    (member) => member.role === "Agent"
  ).length;

  // Search department members
  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  // Remove a member
  const handleRemoveMember = (member: Member) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} from this department?`
    );

    if (!confirmed) return;

    setMembers((previous) =>
      previous.filter((item) => item.id !== member.id)
    );

    setSuccessMessage("Member removed successfully.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <div className="space-y-8">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Team & Agents
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View and manage the members assigned to your department.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {/* Team Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="rounded-xl border border-secondary/20 bg-background p-5">
          <p className="text-sm text-secondary">
            Total Team Members
          </p>

          <h2 className="mt-2 text-3xl font-bold text-body-text">
            {totalMembers}
          </h2>
        </div>

        <div className="rounded-xl border border-secondary/20 bg-background p-5">
          <p className="text-sm text-secondary">
            Assigned Agents
          </p>

          <h2 className="mt-2 text-3xl font-bold text-body-text">
            {totalAgents}
          </h2>
        </div>

      </div>

      {/* Department Members */}
      <section className="space-y-4">

        <div>
          <h2 className="text-xl font-semibold text-body-text">
            Department Members
          </h2>

        
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-secondary/30 bg-background px-4 py-3 text-sm outline-none focus:border-[#6D91B2] sm:max-w-sm"
          />

          <p className="text-sm text-secondary">
            {filteredMembers.length} members found
          </p>

        </div>

        {/* Members Table */}
        <div className="overflow-x-auto rounded-xl border border-secondary/20">

          <table className="w-full min-w-[750px] text-left text-sm">

            <thead className="bg-accent/5 text-secondary">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Name
                </th>

                <th className="px-5 py-4 font-semibold">
                  Email
                </th>

                <th className="px-5 py-4 font-semibold">
                  Role
                </th>

                <th className="px-5 py-4 font-semibold">
                  Date Joined
                </th>

                {canRemoveMembers && (
                  <th className="px-5 py-4 text-center font-semibold">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary/20">

              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="transition hover:bg-accent/5"
                  >

                    <td className="px-5 py-4 font-medium text-body-text">
                      {member.name}
                    </td>

                    <td className="px-5 py-4 text-secondary">
                      {member.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          member.role === "Agent"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-secondary">
                      {member.dateJoined}
                    </td>

                    {canRemoveMembers && (
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    )}

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canRemoveMembers ? 5 : 4}
                    className="px-5 py-12 text-center text-secondary"
                  >
                    {searchTerm
                      ? "No members match your search."
                      : "No members have been assigned to this department yet."}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default TeamAgents;


              
