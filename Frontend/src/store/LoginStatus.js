import { create } from 'zustand'

const getInitialStatus = () => {
  const stored = localStorage.getItem("isLoggedIn");
  return stored === "true"; 
};

export const useLoggedInStatus = create((set) => ({
  isLoggedIn: getInitialStatus(), 

  changeStatus: () => {
    set((state) => {
      const nextStatus = !state.isLoggedIn;   
      localStorage.setItem("isLoggedIn", nextStatus.toString());      
      return { isLoggedIn: nextStatus };
    });
  }
}));