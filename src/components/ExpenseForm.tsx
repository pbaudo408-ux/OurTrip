import { useState } from "react";
import { X, Plus } from "lucide-react";
import { TravelButton } from "@/components/TravelButton";
import { TravelCard, TravelCardContent, TravelCardHeader, TravelCardTitle } from "@/components/TravelCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Expense } from "@/types/trip";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  participants: string[];
  onExpenseAdded: (expense: Expense) => void;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ participants, onExpenseAdded, onClose }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const toggleParticipant = (participant: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participant) 
        ? prev.filter(p => p !== participant)
        : [...prev, participant]
    );
  };

  const selectAllParticipants = () => {
    setSelectedParticipants(participants);
  };

  const clearParticipants = () => {
    setSelectedParticipants([]);
  };

  const handleSubmit = () => {
    if (!amount || !paidBy || !description || selectedParticipants.length === 0) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi",
        variant: "destructive"
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      paidBy,
      description,
      date: new Date(),
      participants: selectedParticipants
    };

    onExpenseAdded(expense);
    toast({
      title: "Spesa aggiunta!",
      description: `€${amount} per ${description}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-background rounded-t-3xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Nuova spesa</h2>
          <TravelButton variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </TravelButton>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">Importo (€) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 text-lg"
            />
          </div>

          {/* Paid By */}
          <div>
            <Label className="text-sm font-medium">Chi ha pagato? *</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleziona chi ha pagato" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((participant) => (
                  <SelectItem key={participant} value={participant}>
                    {participant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Descrizione *</Label>
            <Input
              id="description"
              placeholder="es. Cena al ristorante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Chi ha partecipato alla spesa? *</Label>
              <div className="flex gap-2">
                <TravelButton
                  variant="outline"
                  size="sm"
                  onClick={selectAllParticipants}
                  className="text-xs"
                >
                  Tutti
                </TravelButton>
                <TravelButton
                  variant="ghost"
                  size="sm"
                  onClick={clearParticipants}
                  className="text-xs"
                >
                  Nessuno
                </TravelButton>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {participants.map((participant) => (
                <TravelButton
                  key={participant}
                  variant={selectedParticipants.includes(participant) ? "primary" : "outline"}
                  size="sm"
                  onClick={() => toggleParticipant(participant)}
                  className="justify-start"
                >
                  {selectedParticipants.includes(participant) && (
                    <Plus className="h-3 w-3 mr-1 rotate-45" />
                  )}
                  {participant}
                </TravelButton>
              ))}
            </div>
            
            {selectedParticipants.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                €{amount ? (parseFloat(amount) / selectedParticipants.length).toFixed(2) : "0.00"} per persona
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border space-y-3">
          <TravelButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
          >
            Aggiungi spesa
          </TravelButton>
          <TravelButton
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            Annulla
          </TravelButton>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;