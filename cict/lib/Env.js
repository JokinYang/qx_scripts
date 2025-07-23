/**
 * QuantumultX Environment Library
 * Provides utilities for data storage and environment interaction
 */
class Env {
    constructor(name = 'QuantumultX') {
        this.name = name;
    }

    /**
     * Get stored data by key
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored value or default
     */
    getdata(key, defaultValue = null) {
        try {
            const data = $prefs.valueForKey(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.log(`Error getting data for key ${key}: ${e}`);
            return defaultValue;
        }
    }

    /**
     * Set data to storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    setdata(key, value) {
        try {
            const data = typeof value === 'string' ? value : JSON.stringify(value);
            return $prefs.setValueForKey(data, key);
        } catch (e) {
            console.log(`Error setting data for key ${key}: ${e}`);
            return false;
        }
    }

    /**
     * Log message
     * @param {string} message - Message to log
     */
    log(message) {
        console.log(`[${this.name}] ${message}`);
    }

    /**
     * Send HTTP response
     * @param {any} response - Response data
     */
    done(response) {
        $done(response);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Env;
} else {
    this.Env = Env;
}