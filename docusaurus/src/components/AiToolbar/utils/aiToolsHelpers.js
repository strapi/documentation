import { aiToolsConfig } from '../config/aiToolsConfig';

export const getPrimaryAction = () => {
  return aiToolsConfig.actions.find(action => action.id === aiToolsConfig.primaryActionId);
};

export const getDropdownActions = () => {
  return aiToolsConfig.actions.filter(action => action.id !== aiToolsConfig.primaryActionId);
};

export const getActionById = (id) => {
  return aiToolsConfig.actions.find(action => action.id === id);
};

export const getAllActions = () => {
  return aiToolsConfig.actions;
};

// Utility to check if an action exists
export const hasAction = (id) => {
  return aiToolsConfig.actions.some(action => action.id === id);
};

// Utility to get the complete configuration
export const getConfig = () => {
  return aiToolsConfig;
};