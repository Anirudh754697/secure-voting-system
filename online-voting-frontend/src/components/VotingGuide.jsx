export default function VotingGuide() {
  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-3xl font-bold text-gray-800 mb-2">Voter's Guide</h3>
      <p className="text-gray-600 mb-8">Everything you need to know about casting your vote securely.</p>

      <div className="space-y-8">
        <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
          <h4 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <span className="bg-indigo-200 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Why Your Vote Matters
          </h4>
          <p className="text-gray-700 leading-relaxed">
            Voting is the cornerstone of our democracy. Every single vote shapes the future of our nation, our policies, and our community. 
            By participating in this election, you exercise your fundamental right to choose your representatives and hold them accountable.
          </p>
        </section>

        <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
          <h4 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span className="bg-blue-200 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            How to Cast Your Vote
          </h4>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-2">
            <li>Navigate to the <strong>Elections</strong> tab using the sidebar menu.</li>
            <li>Select an active election from the list. Read about the candidates available.</li>
            <li>Click <strong>Cast Vote</strong> on your preferred candidate.</li>
            <li>Once your vote is cast, it is irreversibly encrypted and stored. You cannot vote twice in the same election.</li>
          </ul>
        </section>

        <section className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
          <h4 className="text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-200 text-emerald-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Security & Anonymity
          </h4>
          <p className="text-gray-700 leading-relaxed">
            Our system uses state-of-the-art cryptographic hashing to match your Aadhar and PAN details without ever storing them in plain text. 
            Additionally, the moment you cast your vote, your identity is detached from the voting choice, ensuring **complete anonymity**.
          </p>
        </section>
      </div>
    </div>
  );
}
