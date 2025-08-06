import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, DollarSign, Plus, MapPin, GripVertical, Euro, Users, Calendar } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { TravelButton } from "@/components/TravelButton";
import { TravelCard, TravelCardContent, TravelCardHeader, TravelCardTitle } from "@/components/TravelCard";
import { Input } from "@/components/ui/input";
import { Trip, PointOfInterest, Expense, loadTripsFromStorage, saveTripsToStorage, calculateBalances } from "@/types/trip";
import LeafletMap from "@/components/LeafletMap";
import ExpenseForm from "@/components/ExpenseForm";
import { useToast } from "@/hooks/use-toast";

const TripView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'expenses'>('map');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!id) return;
    
    const trips = loadTripsFromStorage();
    const foundTrip = trips.find(t => t.id === id);
    
    if (!foundTrip) {
      toast({
        title: "Viaggio non trovato",
        description: "Il viaggio che stai cercando non esiste",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    setTrip(foundTrip);
  }, [id, navigate, toast]);

  const updateTrip = (updatedTrip: Trip) => {
    const trips = loadTripsFromStorage();
    const index = trips.findIndex(t => t.id === updatedTrip.id);
    if (index !== -1) {
      trips[index] = updatedTrip;
      saveTripsToStorage(trips);
      setTrip(updatedTrip);
    }
  };

  // Funzione per ottenere lat/lng da nome usando Nominatim
  async function geocodePlaceName(name: string): Promise<{ lat: number, lng: number } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'it' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  }

  // Funzione per ottenere il nome dal reverse geocoding
  async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=it`;
    const res = await fetch(url);
    const data = await res.json();
    return data.display_name || null;
  }

  // Modifica addPointOfInterest per usare la geocodifica
  const addPointOfInterest = async () => {
    if (!trip) return;

    let poiLat: number | undefined = undefined;
    let poiLng: number | undefined = undefined;
    let poiName = searchQuery.trim();
    let poiAddress = searchQuery.trim();

    // Se coordinate inserite manualmente, usale
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      poiLat = Number(lat);
      poiLng = Number(lng);

      // Se non c'è nome, prova a ricavarlo dalle coordinate
      if (!poiName) {
        const reverseName = await reverseGeocode(poiLat, poiLng);
        if (reverseName) {
          poiName = reverseName;
          poiAddress = reverseName;
        }
      }
    } else if (poiName) {
      // Se c'è nome, prova a geocodificare
      const geo = await geocodePlaceName(poiName);
      if (geo) {
        poiLat = geo.lat;
        poiLng = geo.lng;
      }
    } else {
      // Nessun dato valido
      return;
    }

    const newPOI: PointOfInterest = {
      id: Date.now().toString(),
      name: poiName,
      address: poiAddress,
      order: trip.pointsOfInterest.length,
      lat: poiLat,
      lng: poiLng,
      googleMapsUrl: poiLat && poiLng ? `https://maps.google.com/?q=${poiLat},${poiLng}` : undefined,
    };

    const updatedTrip = {
      ...trip,
      pointsOfInterest: [...trip.pointsOfInterest, newPOI]
    };

    updateTrip(updatedTrip);
    setSearchQuery("");
    setLat("");
    setLng("");
    toast({
      title: "Punto aggiunto!",
      description: `${newPOI.name} è stato aggiunto alla lista`
    });
  };

  const onDragEnd = (result: any) => {
    if (!trip || !result.destination) return;

    const items = Array.from(trip.pointsOfInterest);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    const updatedTrip = {
      ...trip,
      pointsOfInterest: reorderedItems
    };

    updateTrip(updatedTrip);
  };

  const addExpense = (expense: Expense) => {
    if (!trip) return;

    const updatedTrip = {
      ...trip,
      expenses: [...(trip.expenses || []), expense]
    };

    updateTrip(updatedTrip);
  };

  const removePointOfInterest = (poiId: string) => {
    if (!trip) return;

    const updatedTrip = {
      ...trip,
      pointsOfInterest: trip.pointsOfInterest.filter(poi => poi.id !== poiId)
    };

    updateTrip(updatedTrip);
    toast({
      title: "Punto rimosso",
      description: "Il punto di interesse è stato rimosso"
    });
  };

  // Autocomplete: fetch suggestions from Nominatim
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=20`,
      { signal: controller.signal, headers: { "Accept-Language": "it" } }
    )
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch(() => setSuggestions([]))
      .finally(() => setIsLoadingSuggestions(false));
    return () => controller.abort();
  }, [searchQuery]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento viaggio...</p>
        </div>
      </div>
    );
  }

  const balances = calculateBalances(trip.expenses || [], trip.participants);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-travel p-6 rounded-b-3xl shadow-travel">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <TravelButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/trips')}
              className="mr-3 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </TravelButton>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
              <p className="text-white/80 text-sm">{trip.participants.length} partecipanti</p>
            </div>
          </div>
          
          {/* Search Bar with Money Button */}
          <div className="relative mb-4 z-30">
            <TravelButton
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 bg-travel-orange hover:bg-travel-orange/90"
              onClick={() => setShowExpenseForm(true)}
            >
              <DollarSign className="h-4 w-4 text-white" />
            </TravelButton>
            <div className="relative">
              <Input
                placeholder="Aggiungi punto di interesse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPointOfInterest()}
                className="pl-20 pr-12 h-12 bg-white/95 backdrop-blur-sm border-white/20 rounded-xl mb-2"
                autoComplete="off"
              />
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Latitudine"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-1/2"
                  type="number"
                  step="any"
                />
                <Input
                  placeholder="Longitudine"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-1/2"
                  type="number"
                  step="any"
                />
              </div>
              {(searchQuery || lat || lng) && (
                <TravelButton
                  variant="ghost"
                  size="icon"
                  onClick={addPointOfInterest}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="h-4 w-4" />
                </TravelButton>
              )}

              {/* SUGGERIMENTI */}
              {suggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto"
                >
                  {isLoadingSuggestions && (
                    <li className="px-4 py-2 text-sm text-muted-foreground">Caricamento...</li>
                  )}
                  {suggestions.map((place: any) => (
                    <li
                      key={place.place_id}
                      className="px-4 py-2 cursor-pointer hover:bg-primary/10 text-sm"
                      onClick={() => {
                        setSearchQuery(place.display_name);
                        setSuggestions([]);
                      }}
                    >
                      {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/20 rounded-xl p-1">
            <TravelButton
              variant={activeTab === 'map' ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab('map')}
              className="flex-1 text-white"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Mappa
            </TravelButton>
            <TravelButton
              variant={activeTab === 'expenses' ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab('expenses')}
              className="flex-1 text-white"
            >
              <Euro className="h-4 w-4 mr-2" />
              Spese
            </TravelButton>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {activeTab === 'map' ? (
          <>
            {/* Map */}
            <div className="h-64 mb-6 rounded-xl overflow-hidden z-0" >
              <LeafletMap pointsOfInterest={trip.pointsOfInterest} />
            </div>

            {/* Points of Interest */}
            <TravelCard className="mb-6">
              <TravelCardHeader>
                <TravelCardTitle className="flex items-center justify-between">
                  <span>Punti di interesse ({trip.pointsOfInterest.length})</span>
                </TravelCardTitle>
              </TravelCardHeader>
              <TravelCardContent>
                {trip.pointsOfInterest.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    <p>Nessun punto di interesse</p>
                    <p className="text-sm">Usa la barra di ricerca per aggiungerne</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="points">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {trip.pointsOfInterest
                            .sort((a, b) => a.order - b.order)
                            .map((poi, index) => (
                            <Draggable key={poi.id} draggableId={poi.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg border transition-all ${
                                    snapshot.isDragging ? 'shadow-travel scale-105' : ''
                                  }`}
                                >
                                  <div {...provided.dragHandleProps} className="text-muted-foreground">
                                    <GripVertical className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">{poi.name}</p>
                                    <div className="text-xs text-muted-foreground">
                                      {typeof poi.lat === "number" && typeof poi.lng === "number"
                                        ? `Lat: ${poi.lat}, Lng: ${poi.lng}`
                                        : "Coordinate non disponibili"}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <TravelButton
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(poi.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(poi.address)}`, '_blank')}
                                    >
                                      Mappa
                                    </TravelButton>
                                    <TravelButton
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removePointOfInterest(poi.id)}
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      ×
                                    </TravelButton>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </TravelCardContent>
            </TravelCard>
          </>
        ) : (
          <>
            {/* Expenses Summary */}
            <TravelCard className="mb-6">
              <TravelCardHeader>
                <TravelCardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Riepilogo spese
                </TravelCardTitle>
              </TravelCardHeader>
              <TravelCardContent>
                {trip.expenses && trip.expenses.length > 0 ? (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-2xl font-bold text-primary">
                        €{trip.expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Totale spese</p>
                    </div>
                    
                    {/* Balances */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-foreground">Saldi:</h4>
                      {balances.map((balance) => (
                        <div key={balance.person} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm font-medium">{balance.person}</span>
                          <span className={`text-sm font-bold ${
                            balance.balance > 0 ? 'text-destructive' : balance.balance < 0 ? 'text-travel-green' : 'text-muted-foreground'
                          }`}>
                            {balance.balance > 0 ? `Deve €${balance.balance.toFixed(2)}` : 
                             balance.balance < 0 ? `Riceve €${(-balance.balance).toFixed(2)}` : 
                             'In pari'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Euro className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nessuna spesa registrata</p>
                    <p className="text-sm">Tocca l'icona € per aggiungere una spesa</p>
                  </div>
                )}
              </TravelCardContent>
            </TravelCard>

            {/* Expenses List */}
            {trip.expenses && trip.expenses.length > 0 && (
              <TravelCard>
                <TravelCardHeader>
                  <TravelCardTitle>Elenco spese</TravelCardTitle>
                </TravelCardHeader>
                <TravelCardContent>
                  <div className="space-y-3">
                    {trip.expenses
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((expense) => (
                      <div key={expense.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-foreground">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Pagato da {expense.paidBy}
                            </p>
                          </div>
                          <p className="font-bold text-primary">€{expense.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {expense.date.toLocaleDateString('it-IT')}
                          <Users className="h-3 w-3 ml-2" />
                          {expense.participants.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </TravelCardContent>
              </TravelCard>
            )}
          </>
        )}
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          participants={trip.participants}
          onExpenseAdded={addExpense}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  );
};

export default TripView;