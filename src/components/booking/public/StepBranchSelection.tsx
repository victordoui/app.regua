import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { ClientBookingForm, Branch } from '@/types/publicBooking';

interface StepBranchSelectionProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  branches: Branch[];
}

const StepBranchSelection: React.FC<StepBranchSelectionProps> = ({ formData, setFormData, branches }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              formData.selectedBranch === branch.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, selectedBranch: branch.id, selectedBarber: '', selectedServices: [] }))}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{branch.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{branch.address}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{branch.working_hours}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepBranchSelection;