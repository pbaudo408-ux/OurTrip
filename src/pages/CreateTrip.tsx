import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Users } from "lucide-react";
import { TravelButton } from "@/components/TravelButton";
import { TravelCard, TravelCardContent, TravelCardHeader, TravelCardTitle } from "@/components/TravelCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trip, saveTripsToStorage, loadTripsFromStorage } from "@/types/trip";
import { useToast } from "@/hooks/use-toast";

const CreateTrip = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tripName, setTripName] = useState("");
  const [participants, setParticipants] = useState<string[]>([""]);
  const [isCreating, setIsCreating] = useState(false);

  const addParticipant = () => {
    setParticipants([...participants, ""]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const createTrip = async () => {
    if (!tripName.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il nome del viaggio",
        variant: "destructive"
      });
      return;
    }

    const validParticipants = participants.filter(p => p.trim() !== "");
    if (validParticipants.length === 0) {
      toast({
        title: "Errore", 
        description: "Aggiungi almeno un partecipante",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    const newTrip: Trip = {
      id: Date.now().toString(),
      name: tripName.trim(),
      participants: validParticipants,
      createdAt: new Date(),
      pointsOfInterest: [],
      expenses: []
    };

    try {
      const existingTrips = loadTripsFromStorage();
      const updatedTrips = [newTrip, ...existingTrips];
      saveTripsToStorage(updatedTrips);

      toast({
        title: "Viaggio creato!",
        description: `${tripName} è stato creato con successo`
      });

      // Navigate to the trip view
      navigate(`/trip/${newTrip.id}`);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare il viaggio",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
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
            <h1 className="text-2xl font-bold text-white">Crea nuovo viaggio</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6 animate-fade-in">
        {/* Trip Name */}
        <TravelCard>
          <TravelCardHeader>
            <TravelCardTitle>Dettagli del viaggio</TravelCardTitle>
          </TravelCardHeader>
          <TravelCardContent className="space-y-4">
            <div>
              <Label htmlFor="tripName" className="text-sm font-medium">
                Nome del viaggio *
              </Label>
              <Input
                id="tripName"
                placeholder="es. Vacanze in Toscana"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="mt-1"
              />
            </div>
          </TravelCardContent>
        </TravelCard>

        {/* Participants */}
        <TravelCard>
          <TravelCardHeader>
            <div className="flex items-center justify-between">
              <TravelCardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partecipanti
              </TravelCardTitle>
              <TravelButton
                variant="outline"
                size="sm"
                onClick={addParticipant}
              >
                <Plus className="h-4 w-4" />
              </TravelButton>
            </div>
          </TravelCardHeader>
          <TravelCardContent className="space-y-3">
            {participants.map((participant, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Partecipante ${index + 1}`}
                  value={participant}
                  onChange={(e) => updateParticipant(index, e.target.value)}
                  className="flex-1"
                />
                {participants.length > 1 && (
                  <TravelButton
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParticipant(index)}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </TravelButton>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Aggiungi i nomi di tutte le persone che parteciperanno al viaggio
            </p>
          </TravelCardContent>
        </TravelCard>

        {/* Summary */}
        {tripName && participants.some(p => p.trim()) && (
          <TravelCard className="border-primary/20 bg-primary/5 animate-scale-in">
            <TravelCardContent className="p-4">
              <h3 className="font-medium text-primary mb-2">Riepilogo</h3>
              <p className="text-sm text-foreground mb-1">
                <strong>Viaggio:</strong> {tripName}
              </p>
              <p className="text-sm text-foreground">
                <strong>Partecipanti:</strong> {participants.filter(p => p.trim()).length}
              </p>
            </TravelCardContent>
          </TravelCard>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <TravelButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={createTrip}
            disabled={isCreating}
          >
            {isCreating ? "Creazione..." : "Crea viaggio"}
          </TravelButton>
          
          <TravelButton
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Annulla
          </TravelButton>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;