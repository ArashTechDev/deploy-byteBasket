import Header from '../components/layout/Header';  // Adjust path as needed

const DonatePage = ({ onNavigate }) => (
  <div className="min-h-screen bg-gray-200">
    <Header currentPage="donate" onNavigate={onNavigate} />
    
    <main className="py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          For Donors
        </h1>
        
        <div className="bg-gray-600 rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <div className="block text-white text-sm font-medium mb-2">
                Name
              </div>
              <input 
                type="text" 
                placeholder="Value"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
              />
            </div>
            
            <div>
              <div className="block text-white text-sm font-medium mb-2">
                Time
              </div>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-500">
                <option>Choose a Time</option>
                <option>9:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>12:00 PM</option>
                <option>1:00 PM</option>
                <option>2:00 PM</option>
                <option>3:00 PM</option>
                <option>4:00 PM</option>
                <option>5:00 PM</option>
              </select>
            </div>
            
            <div>
              <div className="block text-white text-sm font-medium mb-2">
                Day
              </div>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-500">
                <option>Choose a Day</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>
            
            <div>
              <div className="block text-white text-sm font-medium mb-2">
                Product Name
              </div>
              <input 
                type="text" 
                placeholder="Value"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
              />
            </div>
            
            <div>
              <div className="block text-white text-sm font-medium mb-2">
                Quantity
              </div>
              <input 
                type="number" 
                placeholder="Value"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
              />
            </div>
            
            <div>
              <div className="block text-white text-sm font-medium mb-2">
                Product Image
              </div>
              <input 
                type="file" 
                accept="image/*"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-orange-400 file:text-white file:font-medium hover:file:bg-orange-500"
              />
              <p className="text-gray-300 text-xs mt-1">Upload an image of the product you want to donate</p>
            </div>
            
            <button 
              type="button"
              className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-md font-medium transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default DonatePage;