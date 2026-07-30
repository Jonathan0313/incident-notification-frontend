import { useState } from 'react';

export function useAffectedServices(initialServices: any[] = []) {
  const [affectedServices, setAffectedServices] = useState<any[]>(initialServices);

  const handleAddService = () => {
    setAffectedServices([...affectedServices, { nameService: '', status: 'OK', startTime: '', endTime: '' }]);
  };

  const handleDeleteService = (index: number) => {
    setAffectedServices(affectedServices.filter((_, idx) => idx !== index));
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updated = [...affectedServices];
    updated[index] = { ...updated[index], [field]: value };
    setAffectedServices(updated);
  };

  const handleApplyFirstStartTime = () => {
    if (affectedServices.length === 0) return;
    const firstTime = affectedServices[0].startTime;
    setAffectedServices(affectedServices.map(s => ({ ...s, startTime: firstTime })));
  };

  const handleApplyFirstEndTime = () => {
    if (affectedServices.length === 0) return;
    const firstTime = affectedServices[0].endTime;
    setAffectedServices(affectedServices.map(s => ({ ...s, endTime: firstTime })));
  };

  const handleApplyFirstAffectationType = () => {
    if (affectedServices.length === 0) return;
    const firstType = affectedServices[0].status;
    setAffectedServices(affectedServices.map(s => ({ ...s, status: firstType })));
  };

  const getCurrentFormattedTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleSetCurrentStartTimeFirst = () => {
    if (affectedServices.length === 0) return;
    const nowStr = getCurrentFormattedTime();
    const updated = [...affectedServices];
    updated[0] = { ...updated[0], startTime: nowStr };
    setAffectedServices(updated);
  };

  const handleSetCurrentEndTimeFirst = () => {
    if (affectedServices.length === 0) return;
    const nowStr = getCurrentFormattedTime();
    const updated = [...affectedServices];
    updated[0] = { ...updated[0], endTime: nowStr };
    setAffectedServices(updated);
  };

  const handleMatchEndTimeWithStartTime = () => {
    setAffectedServices(prevServices => {
      if (!prevServices || prevServices.length === 0) return prevServices;
      const updated = [...prevServices];
      const firstService = updated[0];
      updated[0] = {
        ...firstService,
        endTime: firstService.startTime || firstService.endTime || ''
      };
      return updated;
    });
  };

  return {
    affectedServices,
    setAffectedServices,
    handleAddService,
    handleDeleteService,
    handleServiceChange,
    handleApplyFirstStartTime,
    handleApplyFirstEndTime,
    handleApplyFirstAffectationType,
    handleSetCurrentStartTimeFirst,
    handleSetCurrentEndTimeFirst,
    handleMatchEndTimeWithStartTime,
  };
}