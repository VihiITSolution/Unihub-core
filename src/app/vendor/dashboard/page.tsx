export default function VendorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Vendor Dashboard</h1>
          <p className="text-gray-600">Manage your products and orders</p>
        </div>
        <button className="btn-primary">
          Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: "$0.00", icon: "💰", color: "bg-green-100 text-green-600" },
          { label: "Total Orders", value: "0", icon: "📦", color: "bg-blue-100 text-blue-600" },
          { label: "Active Products", value: "0", icon: "🛍️", color: "bg-purple-100 text-purple-600" },
          { label: "Pending Orders", value: "0", icon: "⏳", color: "bg-orange-100 text-orange-600" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-navy-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
          🛍️
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No Products Yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          Start selling your educational resources, equipment, or merchandise on UniHub.
        </p>
        <button className="btn-primary">
          Create First Product
        </button>
      </div>
    </div>
  );
}
