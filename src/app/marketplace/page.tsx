"use client";

import ComingSoonPage from "@/components/ComingSoonPage";

export default function MarketplacePage() {
  const handleEmailSubmit = async (email: string) => {
    // TODO: Save email to database for notifications
    console.log("Email for marketplace notifications:", email);
  };

  return (
    <ComingSoonPage
      title="UniHub Marketplace"
      description="Buy, sell, and trade items with other students. From textbooks to electronics, find everything you need to enhance your university experience."
      onEmailSubmit={handleEmailSubmit}
    />
  );
}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/marketplace/${product.id}`}>
              <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  {product.title.charAt(0)}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {product.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {product.condition?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 text-sm line-clamp-2 flex-1">
                    {product.description}
                  </p>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Seller: <span className="font-medium">{product.seller?.vendorProfile?.shopName || product.seller?.name || 'Unknown'}</span>
                  </div>
                  
                  <div className="text-sm mb-4">
                    {product.stock > 0 ? (
                      <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                        {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t mt-auto">
                    <span className="text-2xl font-bold text-primary-600">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="btn-primary text-sm px-4 py-2">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Call to Action for Sellers */}
      <div className="mt-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Want to Sell on UniHub?</h2>
        <p className="text-xl mb-6">
          Join our marketplace and reach thousands of students across universities
        </p>
        <Link href="/student/become-vendor" className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block transition">
          Become a Vendor
        </Link>
      </div>
    </div>
  );
}
