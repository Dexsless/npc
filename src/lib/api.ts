
import { supabase } from './supabase';

export const api = {
  getComponents: async () => {
    const { data, error } = await supabase
      .from('components')
      .select('*');
    
    if (error) {
      console.error('Supabase Error:', error);
      return [];
    }
    
    return data.map((item: any) => ({
      ...item,
      price: Number(item.price)
    }));
  },

  createComponent: async (component: any) => {
    const { data, error } = await supabase
      .from('components')
      .insert([component])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  updateComponent: async (id: number, component: any) => {
    const { data, error } = await supabase
      .from('components')
      .update(component)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteComponent: async (id: number) => {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  getMonitors: async () => {
    const { data, error } = await supabase
      .from('monitors')
      .select('*');
      
    if (error) {
      console.error('Supabase Error:', error);
      return [];
    }
    return data;
  },

  createMonitor: async (monitor: any) => {
    const { data, error } = await supabase
      .from('monitors')
      .insert([monitor])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  updateMonitor: async (id: number, monitor: any) => {
    const { data, error } = await supabase
      .from('monitors')
      .update(monitor)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteMonitor: async (id: number) => {
    const { error } = await supabase
      .from('monitors')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
