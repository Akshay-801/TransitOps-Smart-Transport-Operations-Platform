import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';
import { AuthContext } from './AuthContext';

export const FleetContext = createContext();

// Simple mock cryptographic hash generator for audit trails
const generateRecordHash = (data) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0') + 
         Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
};

const INITIAL_VEHICLES = [];
const INITIAL_DRIVERS = [];
const INITIAL_TRIPS = [];
const INITIAL_MAINTENANCE = [];
const INITIAL_EXPENSES = [];
const INITIAL_FUEL_LOGS = [];
const INITIAL_ALERTS = [];

// --- Normalization Translation Mappers ---

const mapVehicleFromApi = (v) => ({
  id: v.id,
  regNumber: v.registrationNumber,
  nameModel: v.name,
  type: v.type,
  maxLoadCapacity: v.maxLoadCapacity,
  currentOdometer: v.odometer || 0,
  acquisitionCost: v.acquisitionCost,
  status: v.status === 'AVAILABLE' ? 'Available' :
          v.status === 'ON_TRIP' ? 'On Trip' :
          v.status === 'IN_SHOP' ? 'In Shop' :
          v.status === 'RETIRED' ? 'Retired' : v.status,
  region: v.region,
  healthScore: v.healthScore || 90,
  predictiveAlertFlag: v.predictiveAlertFlag || false,
  estimatedDaysToFailure: v.estimatedDaysToFailure || 365
});

const mapDriverFromApi = (d) => ({
  id: d.id,
  name: d.name,
  licenseNumber: d.licenseNumber,
  licenseCategory: d.licenseCategory,
  licenseExpiry: d.licenseExpiryDate,
  contact: d.contactNumber,
  safetyScore: d.safetyScore || 95,
  status: d.status === 'AVAILABLE' ? 'Available' :
          d.status === 'ON_TRIP' ? 'On Trip' :
          d.status === 'OFF_DUTY' ? 'Off Duty' :
          d.status === 'SUSPENDED' ? 'Suspended' : d.status,
  region: d.region || 'North'
});

const mapTripFromApi = (t, mappedVehicles = []) => {
  const veh = mappedVehicles.find(v => v.id === t.vehicleId);
  return {
    id: t.id,
    vehicleId: t.vehicleId,
    vehicleReg: veh ? veh.regNumber : (t.vehicleName || '—'),
    driverId: t.driverId,
    source: t.source,
    destination: t.destination,
    cargoWeight: t.cargoWeight,
    plannedDistance: t.plannedDistance,
    actualDistance: t.actualDistance || 0,
    revenue: t.revenue || Math.round(t.plannedDistance * 3.5),
    status: t.status === 'DRAFT' ? 'Draft' :
            t.status === 'DISPATCHED' ? 'Dispatched' :
            t.status === 'COMPLETED' ? 'Completed' :
            t.status === 'CANCELLED' ? 'Cancelled' : t.status,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
    eta: t.status === 'DISPATCHED' ? 'Calculating...' : t.status === 'DRAFT' ? 'Awaiting vehicle' : '—'
  };
};

const mapMaintenanceFromApi = (m, mappedVehicles = []) => {
  const veh = mappedVehicles.find(v => v.id === m.vehicleId);
  return {
    id: m.id,
    vehicleId: m.vehicleId,
    vehicleReg: veh ? veh.regNumber : (m.vehicleName || '—'),
    issueDescription: m.description,
    maintenanceType: m.maintenanceType || 'Repair',
    priority: m.priority || 'Medium',
    cost: m.cost || 0,
    isOpen: m.status === 'OPEN',
    resolvedDate: m.closedAt ? m.closedAt.split('T')[0] : null
  };
};

const mapExpenseFromApi = (exp, mappedVehicles = []) => {
  const veh = mappedVehicles.find(v => v.id === exp.vehicleId);
  return {
    id: exp.id,
    vehicleId: exp.vehicleId,
    vehicleReg: veh ? veh.regNumber : (exp.vehicleName || '—'),
    tripId: exp.tripId,
    expenseType: exp.category === 'TOLL' ? 'Tolls' :
                 exp.category === 'MAINTENANCE' ? 'Maintenance' : 'Other',
    amount: exp.amount,
    description: exp.description || '',
    date: exp.expenseDate ? exp.expenseDate.split('T')[0] : (exp.createdAt ? exp.createdAt.split('T')[0] : ''),
    isAnomaly: exp.amount > 1000,
    recordHash: exp.recordHash || '0x' + Math.abs(exp.id.split('-').reduce((acc, curr) => acc + curr.charCodeAt(0), 0)).toString(16).toUpperCase().padStart(8, '0') + 'F5D2B4A1'
  };
};

export const FleetProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const [isApiOnline, setIsApiOnline] = useState(false);

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('transit_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('transit_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('transit_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState(() => {
    const saved = localStorage.getItem('transit_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('transit_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [fuelLogs, setFuelLogs] = useState(() => {
    const saved = localStorage.getItem('transit_fuel');
    return saved ? JSON.parse(saved) : INITIAL_FUEL_LOGS;
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('transit_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Fetch all data from API (re-runs and falls back gracefully)
  const loadDataFromApi = async () => {
    try {
      const apiVehicles = await apiService.vehicles.getAll();
      const apiDrivers = await apiService.drivers.getAll();
      const apiTrips = await apiService.trips.getAll();
      const apiMaintenance = await apiService.maintenance.getAll();
      const apiExpenses = await apiService.expenses.getAll();
      const apiFuelLogs = await apiService.fuel.getAll();

      const mappedVehicles = apiVehicles.map(mapVehicleFromApi);
      const mappedDrivers = apiDrivers.map(mapDriverFromApi);
      const mappedTrips = apiTrips.map(t => mapTripFromApi(t, mappedVehicles));
      const mappedMaintenance = apiMaintenance.map(m => mapMaintenanceFromApi(m, mappedVehicles));
      const mappedExpenses = apiExpenses.map(e => mapExpenseFromApi(e, mappedVehicles));
      const mappedFuelLogs = apiFuelLogs.map(l => ({
        id: l.id,
        vehicleReg: mappedVehicles.find(v => v.id === l.vehicleId)?.regNumber || '—',
        tripId: l.tripId,
        liters: l.liters,
        pricePerLiter: l.liters > 0 ? parseFloat((l.cost / l.liters).toFixed(2)) : 0,
        totalCost: l.cost,
        date: l.logDate,
        isAnomaly: l.cost > 1000
      }));

      setVehicles(mappedVehicles);
      setDrivers(mappedDrivers);
      setTrips(mappedTrips);
      setMaintenanceLogs(mappedMaintenance);
      setExpenses(mappedExpenses);
      setFuelLogs(mappedFuelLogs);
      setIsApiOnline(true);
    } catch (error) {
      console.warn("REST API is offline, using localized mock state.", error);
      setIsApiOnline(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDataFromApi();
  }, []);

  // Save changes locally in offline fallback mode
  useEffect(() => {
    if (!isApiOnline) {
      localStorage.setItem('transit_vehicles', JSON.stringify(vehicles));
    }
  }, [vehicles, isApiOnline]);

  useEffect(() => {
    if (!isApiOnline) {
      localStorage.setItem('transit_drivers', JSON.stringify(drivers));
    }
  }, [drivers, isApiOnline]);

  useEffect(() => {
    if (!isApiOnline) {
      localStorage.setItem('transit_trips', JSON.stringify(trips));
    }
  }, [trips, isApiOnline]);

  useEffect(() => {
    if (!isApiOnline) {
      localStorage.setItem('transit_maintenance', JSON.stringify(maintenanceLogs));
    }
  }, [maintenanceLogs, isApiOnline]);

  useEffect(() => {
    if (!isApiOnline) {
      localStorage.setItem('transit_expenses', JSON.stringify(expenses));
    }
  }, [expenses, isApiOnline]);

  useEffect(() => {
    if (!isApiOnline) {
      localStorage.setItem('transit_fuel', JSON.stringify(fuelLogs));
    }
  }, [fuelLogs, isApiOnline]);

  // --- API Mutative Actions ---

  // Add Vehicle
  const addVehicle = async (vehicle) => {
    if (isApiOnline) {
      const payload = {
        registrationNumber: vehicle.regNumber.toUpperCase(),
        name: vehicle.nameModel,
        vehicleType: vehicle.type,   // backend field is vehicleType, not type
        type: vehicle.type,
        maxLoadCapacity: parseFloat(vehicle.maxLoadCapacity),
        odometer: parseFloat(vehicle.currentOdometer || 0),
        acquisitionCost: parseFloat(vehicle.acquisitionCost),
        region: vehicle.region,
        status: 'AVAILABLE'
      };
      await apiService.vehicles.create(payload);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const exists = vehicles.some(v => v.regNumber.toUpperCase() === vehicle.regNumber.toUpperCase());
    if (exists) {
      throw new Error(`Vehicle with registration ${vehicle.regNumber} already exists.`);
    }
    const newVehicle = {
      ...vehicle,
      id: 'mock-veh-' + Math.random().toString(36).substr(2, 9),
      regNumber: vehicle.regNumber.toUpperCase(),
      healthScore: 100,
      predictiveAlertFlag: false,
      estimatedDaysToFailure: 365
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  // Add Driver
  const addDriver = async (driver) => {
    if (isApiOnline) {
      const payload = {
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        licenseCategory: driver.licenseCategory,
        licenseExpiryDate: driver.licenseExpiry,
        contactNumber: driver.contact,
        safetyScore: driver.safetyScore || 90,   // required by backend DTO
        status: 'AVAILABLE'                        // required by backend DTO
      };
      await apiService.drivers.create(payload);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const newDriver = {
      ...driver,
      id: drivers.length + 1,
      safetyScore: 90
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  // Create Trip
  const createTrip = async (tripData) => {
    if (isApiOnline) {
      const vehicle = vehicles.find(v => v.regNumber === tripData.vehicleReg);
      // Use real logged-in user UUID — fixes 500 "User not found" error
      const createdById = auth?.user?.userId;
      if (!createdById) throw new Error('User session missing. Please log in again.');
      const payload = {
        vehicleId: vehicle ? vehicle.id : null,
        driverId: tripData.driverId || null,
        createdById: createdById,
        source: tripData.source,
        destination: tripData.destination,
        cargoWeight: parseFloat(tripData.cargoWeight),
        plannedDistance: parseFloat(tripData.plannedDistance)
      };
      await apiService.trips.create(payload);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const newTrip = {
      id: `TR${(trips.length + 1).toString().padStart(3, '0')}`,
      ...tripData,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      completedAt: null,
      eta: 'Awaiting vehicle'
    };
    setTrips(prev => [...prev, newTrip]);
  };

  // Dispatch Trip
  const dispatchTrip = async (tripId) => {
    if (isApiOnline) {
      await apiService.trips.dispatch(tripId);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found.');

    const vehicle = vehicles.find(v => v.regNumber === trip.vehicleReg);
    if (!vehicle) throw new Error('No vehicle assigned to this trip.');

    const driver = drivers.find(d => d.id === parseInt(trip.driverId));
    if (!driver) throw new Error('No driver assigned to this trip.');

    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
      throw new Error(`Vehicle ${vehicle.regNumber} is currently ${vehicle.status} and cannot be dispatched.`);
    }
    if (driver.status === 'Suspended' || driver.status === 'Off Duty') {
      throw new Error(`Driver ${driver.name} is currently ${driver.status} and cannot be dispatched.`);
    }
    if (new Date(driver.licenseExpiry) < new Date()) {
      throw new Error(`Driver ${driver.name} has an expired license.`);
    }
    if (trip.cargoWeight > vehicle.maxLoadCapacity) {
      throw new Error(`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg).`);
    }

    const vehicleBusy = vehicles.some(v => v.regNumber === vehicle.regNumber && v.status === 'On Trip');
    if (vehicleBusy) throw new Error(`Vehicle ${vehicle.regNumber} is already on an active trip.`);

    const driverBusy = drivers.some(d => d.id === driver.id && d.status === 'On Trip');
    if (driverBusy) throw new Error(`Driver ${driver.name} is already on an active trip.`);

    setVehicles(prev => prev.map(v => v.regNumber === vehicle.regNumber ? { ...v, status: 'On Trip' } : v));
    setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, status: 'On Trip' } : d));
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'Dispatched', eta: 'Calculating...' } : t));
  };

  // Complete Trip
  const completeTrip = async (tripId, endOdometer, litersConsumed, fuelCost) => {
    if (isApiOnline) {
      const trip = trips.find(t => t.id === tripId);
      const vehicle = vehicles.find(v => v.regNumber === trip.vehicleReg);
      if (!trip || !vehicle) throw new Error('Trip/Vehicle details missing.');

      if (endOdometer <= (vehicle.currentOdometer || 0)) {
        throw new Error(`Odometer reading must be higher than current vehicle odometer (${vehicle.currentOdometer}).`);
      }

      const distance = endOdometer - vehicle.currentOdometer;

      // 1. Complete Trip
      await apiService.trips.complete(tripId, parseFloat(distance));

      // 2. Log Fuel
      if (litersConsumed > 0) {
        await apiService.fuel.log({
          vehicleId: trip.vehicleId,
          tripId: trip.id,
          liters: parseFloat(litersConsumed),
          cost: parseFloat(fuelCost),
          logDate: new Date().toISOString().split('T')[0]
        });

        // 3. Log fuel expense (API category MISC)
        await apiService.expenses.create({
          vehicleId: trip.vehicleId,
          tripId: trip.id,
          category: 'MISC',
          amount: parseFloat(fuelCost),
          expenseDate: new Date().toISOString().split('T')[0],
          description: `Fuel refill ${litersConsumed}L for trip ${trip.id}`
        });
      }

      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found.');

    const vehicle = vehicles.find(v => v.regNumber === trip.vehicleReg);
    const driver = drivers.find(d => d.id === parseInt(trip.driverId));

    if (endOdometer <= (vehicle?.currentOdometer || 0)) {
      throw new Error(`Odometer reading must be higher than current vehicle odometer (${vehicle?.currentOdometer}).`);
    }

    const actualDist = endOdometer - (vehicle?.currentOdometer || 0);

    if (litersConsumed > 0) {
      const isAnomaly = (fuelCost / litersConsumed) > 3.0;
      
      const newFuelLog = {
        id: fuelLogs.length + 1,
        vehicleReg: trip.vehicleReg,
        tripId: trip.id,
        liters: parseFloat(litersConsumed),
        pricePerLiter: parseFloat((fuelCost / litersConsumed).toFixed(2)),
        totalCost: parseFloat(fuelCost),
        date: new Date().toISOString().split('T')[0],
        isAnomaly
      };

      setFuelLogs(prev => [...prev, newFuelLog]);

      const expenseObj = {
        vehicleReg: trip.vehicleReg,
        tripId: trip.id,
        expenseType: 'Fuel',
        amount: parseFloat(fuelCost),
        description: `Fuel refill ${litersConsumed}L for trip ${trip.id}`,
        isAnomaly,
        date: new Date().toISOString().split('T')[0]
      };
      
      const hash = generateRecordHash(expenseObj);

      setExpenses(prev => [...prev, {
        id: prev.length + 1,
        ...expenseObj,
        recordHash: hash
      }]);
    }

    setVehicles(prev => prev.map(v => v.regNumber === trip.vehicleReg ? { ...v, currentOdometer: parseInt(endOdometer), status: 'Available' } : v));
    if (driver) setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, status: 'Available' } : d));
    setTrips(prev => prev.map(t => t.id === tripId ? {
      ...t,
      status: 'Completed',
      actualDistance: actualDist,
      completedAt: new Date().toISOString(),
      eta: '—'
    } : t));
  };

  // Cancel Trip
  const cancelTrip = async (tripId) => {
    if (isApiOnline) {
      await apiService.trips.cancel(tripId);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found.');

    setVehicles(prev => prev.map(v => v.regNumber === trip.vehicleReg ? { ...v, status: 'Available' } : v));
    if (trip.driverId) {
      setDrivers(prev => prev.map(d => d.id === parseInt(trip.driverId) ? { ...d, status: 'Available' } : d));
    }
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'Cancelled', eta: '—' } : t));
  };

  // Add Maintenance
  const addMaintenance = async (log) => {
    if (isApiOnline) {
      const vehicle = vehicles.find(v => v.regNumber === log.vehicleReg);
      const payload = {
        vehicleId: vehicle ? vehicle.id : null,
        description: log.issueDescription
      };
      await apiService.maintenance.open(payload);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const newLog = {
      id: maintenanceLogs.length + 1,
      ...log,
      cost: parseFloat(log.cost),
      isOpen: true,
      resolvedDate: null
    };

    setMaintenanceLogs(prev => [...prev, newLog]);
    setVehicles(prev => prev.map(v => v.regNumber === log.vehicleReg ? { ...v, status: 'In Shop' } : v));

    const expenseObj = {
      vehicleReg: log.vehicleReg,
      tripId: null,
      maintenanceLogId: newLog.id,
      expenseType: 'Maintenance',
      amount: parseFloat(log.cost),
      description: `Maintenance: ${log.issueDescription}`,
      isAnomaly: parseFloat(log.cost) > 5000,
      date: new Date().toISOString().split('T')[0]
    };

    const hash = generateRecordHash(expenseObj);

    setExpenses(prev => [...prev, {
      id: prev.length + 1,
      ...expenseObj,
      recordHash: hash
    }]);
  };

  // Close Maintenance
  const closeMaintenance = async (logId, costValue) => {
    if (isApiOnline) {
      // In the frontend, MaintenanceView passes logId. We close with cost value.
      const parsedCost = parseFloat(costValue || 150); // Fallback default cost if null
      await apiService.maintenance.close(logId, parsedCost);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const log = maintenanceLogs.find(m => m.id === logId);
    if (!log) throw new Error('Maintenance log not found.');

    setMaintenanceLogs(prev => prev.map(m => m.id === logId ? { ...m, isOpen: false, resolvedDate: new Date().toISOString().split('T')[0] } : m));
    setVehicles(prev => prev.map(v => v.regNumber === log.vehicleReg ? { ...v, status: v.status === 'Retired' ? 'Retired' : 'Available' } : v));
  };

  // Log Custom Expense
  const addCustomExpense = async (expenseData) => {
    if (isApiOnline) {
      const vehicle = vehicles.find(v => v.regNumber === expenseData.vehicleReg);
      const payload = {
        vehicleId: vehicle ? vehicle.id : null,
        tripId: null,
        category: expenseData.expenseType === 'Tolls' ? 'TOLL' : 
                  expenseData.expenseType === 'Maintenance' ? 'MAINTENANCE' : 'MISC',
        amount: parseFloat(expenseData.amount),
        expenseDate: new Date().toISOString().split('T')[0],
        description: expenseData.description
      };
      await apiService.expenses.create(payload);
      await loadDataFromApi();
      return;
    }

    // Local Storage Offline Fallback
    const expenseObj = {
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      isAnomaly: parseFloat(expenseData.amount) > 1000,
      date: new Date().toISOString().split('T')[0]
    };

    const hash = generateRecordHash(expenseObj);

    setExpenses(prev => [...prev, {
      id: prev.length + 1,
      ...expenseObj,
      recordHash: hash
    }]);
  };

  return (
    <FleetContext.Provider value={{
      vehicles,
      drivers,
      trips,
      maintenanceLogs,
      expenses,
      fuelLogs,
      alerts,
      isApiOnline,
      refreshData: loadDataFromApi,
      addVehicle,
      addDriver,
      createTrip,
      dispatchTrip,
      completeTrip,
      cancelTrip,
      addMaintenance,
      closeMaintenance,
      addCustomExpense
    }}>
      {children}
    </FleetContext.Provider>
  );
};
