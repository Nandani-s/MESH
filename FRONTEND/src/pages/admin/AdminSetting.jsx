// pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, DollarSign, Shield, Bell,
  CreditCard, Truck, Loader2, AlertCircle, Check
} from 'lucide-react';
import { settingsApi } from '../../api/settings';
import { ApiError } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
  </label>
);

const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    storeName: '', storeEmail: '', storePhone: '', storeAddress: '',
    currency: 'USD', timezone: 'Asia/Kathmandu',
    codEnabled: true, khaltiEnabled: false, esewaEnabled: false,
    freeShippingThreshold: 0, standardShippingRate: 0, expressShippingRate: 0,
    orderEmailNotifications: true, lowStockAlert: true, lowStockThreshold: 10, newCustomerAlert: false,
    twoFactorAuth: false, sessionTimeout: 30, passwordExpiry: 90,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await settingsApi.get();
        setSettings(res.data);
      } catch (error) {
        setLoadError(error instanceof ApiError ? error.message : 'Failed to load settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await settingsApi.update(settings);
      setSettings(res.data);
      await refreshSettings(); // update the navbar instantly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert(error instanceof ApiError ? error.message : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">Manage your store configuration</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {!isLoading && loadError && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger-500" />
          <p className="text-danger-600">{loadError}</p>
        </div>
      )}

      {!isLoading && !loadError && (
        <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
          {/* Tab navigation */}
          <div className="border-b border-border-light">
            <div className="flex overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`px-6 py-3 flex items-center gap-2 transition whitespace-nowrap ${
                    activeTab === id ? 'border-b-2 border-primary-500 text-primary-500' : 'text-text-muted hover:text-text-primary'
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">

            {/* General */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Store Name', key: 'storeName', type: 'text' },
                  { label: 'Store Email', key: 'storeEmail', type: 'email' },
                  { label: 'Phone Number', key: 'storePhone', type: 'tel' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
                    <input type={type} value={settings[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Currency</label>
                  <select value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary">
                    <option value="NPR">NPR (रू)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Store Address</label>
                  <textarea rows="3" value={settings.storeAddress}
                    onChange={(e) => handleChange('storeAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Timezone</label>
                  <select value={settings.timezone} onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary">
                    <option value="Asia/Kathmandu">Nepal Time (UTC+5:45)</option>
                    <option value="Asia/Kolkata">India Standard Time (UTC+5:30)</option>
                    <option value="Asia/Dhaka">Bangladesh Time (UTC+6)</option>
                    <option value="Asia/Shanghai">China Standard Time (UTC+8)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London Time</option>
                  </select>
                </div>
              </div>
            )}

            {/* Payment */}
            {activeTab === 'payment' && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted bg-background-muted rounded-lg p-3">
                  These toggles control which payment options appear at checkout. API keys are configured in your backend <code className="text-xs bg-border-light px-1 rounded">.env</code> file.
                </p>
                {[
                  { key: 'codEnabled', label: 'Cash on Delivery', desc: 'Allow customers to pay on delivery', icon: DollarSign },
                  { key: 'khaltiEnabled', label: 'Khalti', desc: 'Accept payments via Khalti digital wallet', icon: CreditCard },
                  { key: 'esewaEnabled', label: 'eSewa', desc: 'Accept payments via eSewa digital wallet', icon: CreditCard },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-background-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-text-primary" />
                      <div>
                        <p className="font-medium text-text-primary">{label}</p>
                        <p className="text-xs text-text-muted">{desc}</p>
                      </div>
                    </div>
                    <Toggle checked={settings[key]} onChange={(e) => handleChange(key, e.target.checked)} />
                  </div>
                ))}
              </div>
            )}

            {/* Shipping */}
            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Free Shipping Threshold', key: 'freeShippingThreshold', hint: 'Orders above this amount get free shipping' },
                  { label: 'Standard Shipping Rate', key: 'standardShippingRate' },
                  { label: 'Express Shipping Rate', key: 'expressShippingRate' },
                ].map(({ label, key, hint }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
                    <input type="number" step="0.01" value={settings[key]}
                      onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
                    {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {[
                  { key: 'orderEmailNotifications', label: 'Order Email Notifications', desc: 'Send email notifications for new orders' },
                  { key: 'lowStockAlert', label: 'Low Stock Alert', desc: 'Get notified when products are low in stock' },
                  { key: 'newCustomerAlert', label: 'New Customer Alert', desc: 'Get notified when new customers register' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-background-muted rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{label}</p>
                      <p className="text-xs text-text-muted">{desc}</p>
                    </div>
                    <Toggle checked={settings[key]} onChange={(e) => handleChange(key, e.target.checked)} />
                  </div>
                ))}
                {settings.lowStockAlert && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Low Stock Threshold (units)</label>
                    <input type="number" value={settings.lowStockThreshold}
                      onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
                  </div>
                )}
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted bg-background-muted rounded-lg p-3">
                  Security preferences are saved but full enforcement (2FA, auto-logout) requires additional configuration.
                </p>
                <div className="flex items-center justify-between p-4 bg-background-muted rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">Two-Factor Authentication</p>
                    <p className="text-xs text-text-muted">Add an extra layer of security</p>
                  </div>
                  <Toggle checked={settings.twoFactorAuth} onChange={(e) => handleChange('twoFactorAuth', e.target.checked)} />
                </div>
                {[
                  { label: 'Session Timeout (minutes)', key: 'sessionTimeout' },
                  { label: 'Password Expiry (days)', key: 'passwordExpiry' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
                    <input type="number" value={settings[key]}
                      onChange={(e) => handleChange(key, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
                  </div>
                ))}
              </div>
            )}

            {/* Save */}
            <div className="mt-8 pt-6 border-t border-border-light flex items-center gap-4">
              <button type="submit" disabled={isSaving}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings saved</span>
                </div>
              )}
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
