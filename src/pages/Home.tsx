import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, DollarSign, Plus, MapPin } from "lucide-react";
import { TravelButton } from "@/components/TravelButton";
import { TravelCard, TravelCardContent, TravelCardHeader, TravelCardTitle } from "@/components/TravelCard";
import { Input } from "@/components/ui/input";
import { Trip, loadTripsFromStorage } from "@/types/trip";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    const loadedTrips = loadTripsFromStorage();
    setTrips(loadedTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-travel p-6 rounded-b-3xl shadow-travel">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white text-center mb-6">OurTrip</h1>
          
        </div>
      </div>

      {/* Expense Form (if visible) */}
      {showExpenseForm && (
        <div className="max-w-md mx-auto px-6 py-4">
          <TravelCard className="bg-travel-orange/10 border-travel-orange/20">
            <TravelCardHeader>
              <TravelCardTitle className="text-travel-orange">Aggiungi Spesa</TravelCardTitle>
            </TravelCardHeader>
            <TravelCardContent className="space-y-4">
              <Input placeholder="Importo (€)" type="number" className="rounded-lg" />
              <Input placeholder="Chi ha pagato" className="rounded-lg" />
              <Input placeholder="Descrizione spesa" className="rounded-lg" />
              <div className="flex gap-2">
                <TravelButton variant="secondary" size="sm" className="flex-1">
                  Aggiungi
                </TravelButton>
                <TravelButton 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowExpenseForm(false)}
                >
                  Annulla
                </TravelButton>
              </div>
            </TravelCardContent>
          </TravelCard>
        </div>
      )}

      {/* Main Buttons */}
      <div className="max-w-md mx-auto px-6 py-8 space-y-4">
        <TravelButton 
          variant="primary" 
          size="lg" 
          className="w-full justify-start text-lg font-semibold"
          onClick={() => navigate('/trips')}
        >
          <MapPin className="h-5 w-5" />
          Apri un viaggio
        </TravelButton>
        
        <TravelButton 
          variant="secondary" 
          size="lg" 
          className="w-full justify-start text-lg font-semibold"
          onClick={() => navigate('/create-trip')}
        >
          <Plus className="h-5 w-5" />
          Crea un viaggio
        </TravelButton>
      </div>

      {/* Recent Trips Preview */}
      {trips.length > 0 && (
        <div className="max-w-md mx-auto px-6 pb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Viaggi recenti</h2>
          <div className="space-y-3">
            {trips.slice(0, 3).map((trip) => (
              <TravelCard 
                key={trip.id} 
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <TravelCardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-foreground">{trip.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {trip.participants.length} partecipanti
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trip.createdAt.toLocaleDateString('it-IT')}
                    </div>
                  </div>
                </TravelCardContent>
              </TravelCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;