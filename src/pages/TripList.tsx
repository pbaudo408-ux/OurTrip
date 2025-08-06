import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, MapPin } from "lucide-react";
import { TravelButton } from "@/components/TravelButton";
import { TravelCard, TravelCardContent, TravelCardHeader, TravelCardTitle } from "@/components/TravelCard";
import { Trip, loadTripsFromStorage, saveTripsToStorage } from "@/types/trip";

const TripList = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const loadedTrips = loadTripsFromStorage();
    setTrips(loadedTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  }, []);

  const deleteTrip = (tripId: string) => {
    const updatedTrips = trips.filter((trip) => trip.id !== tripId);
    setTrips(updatedTrips);
    saveTripsToStorage(updatedTrips);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-travel p-6 rounded-b-3xl shadow-travel">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <TravelButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="mr-3 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </TravelButton>
            <h1 className="text-2xl font-bold text-white">I tuoi viaggi</h1>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="max-w-md mx-auto px-6 py-6">
        {trips.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Nessun viaggio ancora</h2>
            <p className="text-muted-foreground mb-6">Crea il tuo primo viaggio per iniziare!</p>
            <TravelButton 
              variant="primary"
              onClick={() => navigate('/create-trip')}
            >
              Crea il primo viaggio
            </TravelButton>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {trips.map((trip, index) => (
              <TravelCard 
                key={trip.id}
                className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-travel"
                onClick={() => navigate(`/trip/${trip.id}`)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TravelCardHeader>
                  <div className="flex items-center justify-between">
                    <TravelCardTitle className="text-lg text-foreground">{trip.name}</TravelCardTitle>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // evita il click sulla card
                        if (window.confirm("Sei sicuro di voler eliminare questo viaggio?")) {
                          deleteTrip(trip.id);
                        }
                      }}
                      className="ml-2 text-destructive hover:bg-destructive/10 rounded p-1"
                      title="Elimina viaggio"
                    >
                      ×
                    </button>
                  </div>
                </TravelCardHeader>
                <TravelCardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {trip.participants.length} partecipanti
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {trip.pointsOfInterest?.length || 0} punti di interesse
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {trip.createdAt.toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">
                        Visualizza →
                      </div>
                    </div>
                  </div>
                  
                  {/* Participants preview */}
                  {trip.participants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Partecipanti:</p>
                      <div className="flex flex-wrap gap-1">
                        {trip.participants.slice(0, 3).map((participant, idx) => (
                          <span 
                            key={idx}
                            className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                          >
                            {participant}
                          </span>
                        ))}
                        {trip.participants.length > 3 && (
                          <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                            +{trip.participants.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </TravelCardContent>
              </TravelCard>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6">
        <TravelButton
          variant="primary"
          size="icon"
          className="h-14 w-14 rounded-full shadow-travel hover:shadow-lg"
          onClick={() => navigate('/create-trip')}
        >
          <MapPin className="h-6 w-6" />
        </TravelButton>
      </div>
    </div>
  );
};

export default TripList;