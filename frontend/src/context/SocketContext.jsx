import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [latestLocations, setLatestLocations] = useState({});
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();

    socket.on('location:update', (data) => {
      setLatestLocations((prev) => ({
        ...prev,
        [data.employeeId]: data
      }));
    });

    socket.on('geofence:entry', (data) => {
      const alertMsg = {
        id: Date.now(),
        type: 'ENTRY',
        title: `Employee Entry: ${data.employee.name}`,
        message: `Entered ${data.geofence?.officeName || 'Geofence'} via ${data.log?.verificationMethod || 'GPS'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setLiveAlerts((prev) => [alertMsg, ...prev.slice(0, 9)]);
      setUnreadNotificationsCount((prev) => prev + 1);
    });

    socket.on('geofence:exit', (data) => {
      const alertMsg = {
        id: Date.now(),
        type: 'EXIT',
        title: `Employee Exit: ${data.employee.name}`,
        message: `Exited geofence perimeter after ${data.log?.durationMinutes || 0} minutes`,
        timestamp: new Date().toLocaleTimeString()
      };
      setLiveAlerts((prev) => [alertMsg, ...prev.slice(0, 9)]);
      setUnreadNotificationsCount((prev) => prev + 1);
    });

    socket.on('alert:sos', (data) => {
      const alertMsg = {
        id: Date.now(),
        type: 'SOS_ALERT',
        title: `🚨 EMERGENCY SOS ALERT: ${data.employee.name}`,
        message: `Push button activated on ESP32 device (${data.employee.deviceId})`,
        timestamp: new Date().toLocaleTimeString()
      };
      setLiveAlerts((prev) => [alertMsg, ...prev.slice(0, 9)]);
      setUnreadNotificationsCount((prev) => prev + 1);
    });

    return () => {
      socket.off('location:update');
      socket.off('geofence:entry');
      socket.off('geofence:exit');
      socket.off('alert:sos');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ latestLocations, liveAlerts, unreadNotificationsCount, setUnreadNotificationsCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
