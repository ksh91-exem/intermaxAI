var XMLogJS = {

    /**
     * Date of logger initialized.
     * @static
     * @final
     */
    applicationStartDate: new Date(),

    /**
     * Hashtable of loggers.
     * @static
     * @final
     * @private
     */
    loggers: {},

    getLogger: function(categoryName) {

        // Use default logger if categoryName is not specified or invalid
        if (typeof categoryName !== "string") {
            categoryName = "[default]";
        }

        if (!XMLogJS.loggers[categoryName]) {
            // Create the logger for this name if it doesn't already exist
            XMLogJS.loggers[categoryName] = new XMLogJS.Logger(categoryName);
        }

        return XMLogJS.loggers[categoryName];
    }

};


XMLogJS.Level = function(level, levelStr) {
    this.level = level;
    this.levelStr = levelStr;
};

XMLogJS.Level.prototype =  {

    /**
     * @private
     */
    OFF_INT: Number.MAX_VALUE,
    /**
     * @private
     */
    FATAL_INT: 50000,
    /**
     * @private
     */
    ERROR_INT: 40000,
    /**
     * @private
     */
    WARN_INT: 30000,
    /**
     * @private
     */
    INFO_INT: 20000,
    /**
     * @private
     */
    DEBUG_INT: 10000,
    /**
     * @private
     */
    TRACE_INT: 5000,

    toLevel: function(sArg, defaultLevel) {
        if (sArg === null) {
            return defaultLevel;
        }

        if (typeof sArg === "string") {
            var s = sArg.toUpperCase();

            switch(s) {
                case "ALL": return XMLogJS.Level.ALL;
                case "DEBUG": return XMLogJS.Level.DEBUG;
                case "INFO": return XMLogJS.Level.INFO;
                case "WARN": return XMLogJS.Level.WARN;
                case "ERROR": return XMLogJS.Level.ERROR;
                case "FATAL": return XMLogJS.Level.FATAL;
                case "OFF": return XMLogJS.Level.OFF;
                case "TRACE": return XMLogJS.Level.TRACE;
                default: return defaultLevel;
            }
        } else if (typeof sArg === "number") {
            switch(sArg) {
                case ALL_INT: return XMLogJS.Level.ALL;
                case DEBUG_INT: return XMLogJS.Level.DEBUG;
                case INFO_INT: return XMLogJS.Level.INFO;
                case WARN_INT: return XMLogJS.Level.WARN;
                case ERROR_INT: return XMLogJS.Level.ERROR;
                case FATAL_INT: return XMLogJS.Level.FATAL;
                case OFF_INT: return XMLogJS.Level.OFF;
                case TRACE_INT: return XMLogJS.Level.TRACE;
                default: return defaultLevel;
            }
        } else {
            return defaultLevel;
        }
    },

    /**
     * @return  converted Level to String
     * @type String
     */
    toString: function() {
        return this.levelStr;
    },

    /**
     * @return internal Number value of Level
     * @type Number
     */
    valueOf: function() {
        return this.level;
    }
};


XMLogJS.Logger = function(name) {
    this.loggingEvents = [];

    /** category of logger */
    this.category = name || "";

    /** level to be logged */
    this.level = XMLogJS.Level.FATAL;

    // if multiple log objects are instantiated this will only log to the log
    // object that is declared last can't seem to get the attachEvent method to
    // work correctly
    try {
        window.onerror = this.windowError.bind(this);
    } catch (e) {
        //XMLogJSLogger.fatal(e)
    }
};

XMLogJS.Logger.prototype = {

    /**
     * main log method logging to all available appenders
     *
     * @param {} logLevel
     * @param {} message
     * @param {} exception
     * @private
     */
    log: function() {
        console.debug('%c [Login]  Setting Repository configuration info', 'color:blue;');
    },

    /** clear logging */
    clear : function () {
        try {
            this.loggingEvents = [];
            this.onclear.dispatch();
        } catch(e) {
            // console.debug(e.message)
        }
    },

    /** checks if Level Trace is enabled */
    isTraceEnabled: function() {
        if (this.level.valueOf() <= XMLogJS.Level.TRACE.valueOf()) {
            return true;
        }
        return false;
    },

    /**
     * Trace messages
     * @param message {Object} message to be logged
     */
    trace: function(message) {
        if (this.isTraceEnabled()) {
            this.log(XMLogJS.Level.TRACE, message, null);
        }
    },

    /** checks if Level Debug is enabled */
    isDebugEnabled: function() {
        if (this.level.valueOf() <= XMLogJS.Level.DEBUG.valueOf()) {
            return true;
        }
        return false;
    },

    /**
     * Debug messages
     * @param {Object} message  message to be logged
     * @param {Throwable} throwable
     */
    debug: function(message, throwable) {
        if (this.isDebugEnabled()) {
            this.log(XMLogJS.Level.DEBUG, message, throwable);
        }
    },

    /** checks if Level Info is enabled */
    isInfoEnabled: function() {
        if (this.level.valueOf() <= XMLogJS.Level.INFO.valueOf()) {
            return true;
        }
        return false;
    },

    /**
     * logging info messages
     * @param {Object} message  message to be logged
     * @param {Throwable} throwable
     */
    info: function(message, throwable) {
        if (this.isInfoEnabled()) {
            this.log(XMLogJS.Level.INFO, message, throwable);
        }
    },

    /** checks if Level Warn is enabled */
    isWarnEnabled: function() {
        if (this.level.valueOf() <= XMLogJS.Level.WARN.valueOf()) {
            return true;
        }
        return false;
    },

    /** logging warn messages */
    warn: function(message, throwable) {
        if (this.isWarnEnabled()) {
            this.log(XMLogJS.Level.WARN, message, throwable);
        }
    },

    /** checks if Level Error is enabled */
    isErrorEnabled: function() {
        if (this.level.valueOf() <= XMLogJS.Level.ERROR.valueOf()) {
            return true;
        }
        return false;
    },

    /** logging error messages */
    error: function(message, throwable) {
        if (this.isErrorEnabled()) {
            this.log(XMLogJS.Level.ERROR, message, throwable);
        }
    },

    /** checks if Level Fatal is enabled */
    isFatalEnabled: function() {
        if (this.level.valueOf() <= XMLogJS.Level.FATAL.valueOf()) {
            return true;
        }
        return false;
    },

    /** logging fatal messages */
    fatal: function(message, throwable) {
        if (this.isFatalEnabled()) {
            this.log(XMLogJS.Level.FATAL, message, throwable);
        }
    },

    /**
     * Capture main window errors and log as fatal.
     * @private
     */
    windowError: function(msg, url, line){
        var message = "Error in (" + (url || window.location) + ") on line "+ line +" with message (" + msg + ")";
        this.log(XMLogJS.Level.FATAL, message, null);
    }
};

