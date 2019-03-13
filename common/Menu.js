Ext.define('common.Menu', {
    singleton: true,
    singletonList : {},
    Menucategorization : [
        {text : common.Util.TR('Tools'),                      PGID : 'Tools',        GROUP: 'TOOLS',       PARENTID: 'Panalysis'},
        {text : common.Util.TR('RTM Dashboard'),              PGID : 'Dashboard',    GROUP: 'DASHBOARD'    },
        {text : common.Util.TR('RTM Dashboard'),              PGID : 'E2EMonitor',   GROUP: 'DASHBOARD'    },
        {text : common.Util.TR('WEB'),                        PGID : 'RealtimeWeb',  GROUP: 'REALTIME_WEB' },
        {text : common.Util.TR('Docking Frame'),              PGID : 'Realtime1',    GROUP: 'REALTIME'     },
        {text : common.Util.TR(''),                           PGID : 'Realtime2',    GROUP: 'REALTIME'     },
        {text : common.Util.TR('TP'),                         PGID : 'RealtimeTP',   GROUP: 'REALTIME_TP'  },
        {text : common.Util.TR('Tuxedo'),                     PGID : 'RealtimeTUX',  GROUP: 'REALTIME_TUX'  },
        {text : common.Util.TR('C Daemon'),                   PGID : 'RealtimeCD',   GROUP: 'REALTIME_CD'  },
        {text : common.Util.TR('AI Docking Frame'),           PGID : 'RealtimeAI',   GROUP: 'REALTIME_AI'  },
        {text : common.Util.TR('Performance Analysis'),       PGID : 'Panalysis',    GROUP: 'ANALYSIS'     },
        {text : common.Util.TR(''),                           PGID : 'Panalysis2',   GROUP: 'ANALYSIS_ETE' },
        {text : common.Util.TR('Performance Statistics'),     PGID : 'Pstatistics',  GROUP: 'STATISTICS'   },
        {text : common.Util.TR('Report'),                     PGID : 'Report',       GROUP: 'REPORT',      PARENTID: 'Pstatistics'}
    ],


    mainMenuData : [
        { ID: 'M_AllPerformanceTrend',        PGID: 'Panalysis',    STYPE: 'ALL',   text: common.Util.TR('Performance Trend (ALL)'),          cls: 'view.AllPerformanceTrend'        },
        { ID: 'M_AIPerformanceTrend',         PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Performance Trend (AI)'),           cls: 'view.AIPerformanceTrend'         },
        { ID: 'M_PerformanceTrend',           PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Performance Trend'),                cls: 'view.PerformanceTrend'           },
        { ID: 'M_TransactionTrend',           PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Transaction Trend'),                cls: 'view.ResponseInspector'          },
        { ID: 'M_DBTrend',                    PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('DB Trend'),                         cls: 'view.DBTrend'                    },
        { ID: 'M_StackDumpViewer',            PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Thread Dump Viewer'),               cls: 'view.StackDumpViewer'            },
        { ID: 'M_DiffSource',                 PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Trace of Modified Source'),         cls: 'view.DiffSource'                 },
        { ID: 'M_EnvDiff',                    PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Diff Env'),                         cls: 'view.EnvDiff'                    },
        { ID: 'M_ClientResponseTime',         PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Client Response Time'),             cls: 'view.ClientResponseTime'         },
        { ID: 'M_ClientViewResponseTime',     PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Client View Response Time'),        cls: 'view.ClientViewResponseTime'     },
        { ID: 'M_ComparisonTrend',            PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Performance Comparison Analysis'),  cls: 'view.ComparisonTrend'            },
        { ID: 'M_ElapseDistribution',         PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Elapse Distribution'),              cls: 'view.ElapseDistribution'         },
        { ID: 'M_TxnRankingAnalysis',         PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Transaction Ranking Analysis'),     cls: 'view.TxnRankingAnalysis'         },
        { ID: 'M_SqlRankingAnalysis',         PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('SQL Ranking Analysis'),             cls: 'view.SqlRankingAnalysis'         },
        { ID: 'M_MemoryLeakTracking',         PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Memory Leak Tracking'),             cls: 'view.MemoryLeak'                 },
        { ID: 'M_AbnormalTransactionDetection',PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Abnormal Transaction Detection'),  cls: 'view.AbnormalTransactionDetection'},
        { ID: 'M_LoadPatternAnalysis',        PGID: 'Panalysis',    STYPE: 'WAS',   text: common.Util.TR('Load Pattern Analysis'),            cls: 'view.LoadPatternAnalysis'        },

        { ID: 'M_ScriptManager',              PGID: 'Tools',        STYPE: 'ALL',   text: common.Util.TR('Script Manager'),                   cls: 'view.ScriptManager'              },

        { ID: 'M_TopTransaction',             PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('TOP Transaction Summary'),          cls: 'view.TOPTransaction'             },
        { ID: 'M_TopSQL',                     PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('TOP SQL Summary'),                  cls: 'view.TopSQL_MIN'                 },
        { ID: 'M_TransactionHistory',         PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('Transaction Summary'),              cls: 'view.TxnHistory'                 },
        { ID: 'M_SQLHistory',                 PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('SQL Summary'),                      cls: 'view.SQLHistory'                 },
        { ID: 'M_ExceptionHistory',           PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('Exception Summary'),                cls: 'view.ExceptionHistory'           },
        { ID: 'M_BusinessTxnSummary',         PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('Business Transaction Summary'),     cls: 'view.BusinessTxnSummary'         },
        { ID: 'M_WASWorkloadHistory',         PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('Agent Workload Summary'),           cls: 'view.WASWorkload'                },
        { ID: 'M_AlertHistory',               PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('Alert Summary'),                    cls: 'view.AlertHistory'               },
        { ID: 'M_ClientHistory',              PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('Client Summary'),                   cls: 'view.ClientHistory'              },
        { ID: 'M_EtoEResponseTrend',          PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('EtoE Response Trend'),              cls: 'view.EtoEResponseTrend'          },
        { ID: 'M_WebStat',                    PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('Webserver Summary'),                cls: 'view.WebStat'                    },
        { ID: 'M_UserResponseTimeSummary',    PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('User Response Time Summary'),       cls: 'view.userResponseTimeSummary'    },
        { ID: 'M_DailySummary',               PGID: 'Pstatistics',  STYPE: 'WAS',   text: common.Util.TR('One-day Summary'),                  cls: 'view.DailySummary'               },

        { ID: 'M_AnalysisReport',             PGID: 'Report',      STYPE: 'ALL',    text: common.Util.TR('Analysis Report'),                  cls: 'view.Report'                     },
        { ID: 'M_AnalysisReportConfiguration',PGID: 'Report',      STYPE: 'ALL',    text: common.Util.TR('Analysis Report Configuration'),    cls: 'view.ReportConfigurationView'    },

        // EtoE Dashboard Monitor
        { ID: 'M_dashBusinessView',           PGID: 'E2EMonitor',  STYPE: 'E2E',    text: common.Util.TR('Business Dashboard(Tier)'),                 cls: 'dashboard.TaskMonitor'           },
        { ID: 'M_dashBusinessView2',          PGID: 'E2EMonitor',  STYPE: 'E2E',    text: common.Util.TR('Business Dashboard(Group)'),                cls: 'dashboard.TaskMonitor2'          },
        { ID: 'M_dashBusinessViewWas',        PGID: 'E2EMonitor',  STYPE: 'E2E',    text: common.Util.TR('Business Dashboard(WAS)'),                  cls: 'dashboard.TaskMonitorWas'        },

        // WAS Dashboard Monitor
        { ID: 'M_dashRealtimeMonitor',        PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('RealTime Monitor (Default)'),       cls: 'dashboard.RealtimeMonitor'       },
        { ID: 'M_dashRealtimeMonitor2',       PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('RealTime Monitor (Modified)'),      cls: 'dashboard.RealtimeMonitor2'      },
        { ID: 'M_dashRealtimeMonitor3',       PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('RealTime Monitor (All)'),           cls: 'dashboard.RealtimeMonitor3'      },
        { ID: 'M_dashRealtimeMonitor4',       PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('Group Monitoring View'),            cls: 'dashboard.RealtimeMonitor4'      },
        { ID: 'M_dashManagerView',            PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('Manager View'),                     cls: 'dashboard.ManagerView'           },
        { ID: 'M_dashMultiInstance',          PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('Multiple Instance View'),           cls: 'dashboard.MultiInstance'         },
        { ID: 'M_dashWasDbView',              PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('WAS-DB linked View'),               cls: 'dashboard.WASDBView'             },
        { ID: 'M_dashSysResource',            PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('System Resource View'),             cls: 'dashboard.SysResource'           },
        { ID: 'M_dashMemory',                 PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('Memory View'),                      cls: 'dashboard.Memory'                },
        //{ ID: 'M_dashActiveUser',             PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('User View'),                        cls: 'dashboard.User'                  },
        { ID: 'M_dashTopologyView',           PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('Topology View'),                    cls: 'dashboard.TopologyView'          },
        // { ID: 'M_TaskMonitor',                PGID: 'Dashboard',   STYPE: 'WAS',    text: '업무 관점 모니터링 뷰',                                cls: 'dashboard.TaskMonitor'           },

        { ID: 'M_dashAIMonitor1',             PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('Dashboard'),                          cls: 'dashboard.AIMonitor'       },
        { ID: 'M_dashAIMonitor2',             PGID: 'Dashboard',   STYPE: 'WAS',    text: common.Util.TR('Abnormal Indicators by Instance'),    cls: 'dashboard.AIMonitor2'      },

        { ID: 'M_rtmActivityMonitor',         PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Activity Monitor'),                         cls: 'rtm.src.rtmActivityMonitor'            ,   GPIDX: '1'    },
        { ID: 'M_rtmActivityGroup',           PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Activity Group Monitor'),                   cls: 'rtm.src.rtmActivityGroup'              ,   GPIDX: '1'    },
        { ID: 'M_rtmActiveTxnCount',          PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Active Transaction Count'),                 cls: 'rtm.src.rtmActiveTxnCount'             ,   GPIDX: '1'    },
        { ID: 'M_rtmActiveTxnGroupCount',     PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Active Transaction Group Count'),           cls: 'rtm.src.rtmActiveTxnGroupCount'        ,   GPIDX: '1'    },
        { ID: 'M_rtmActiveTxnList',           PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Active Transaction'),                       cls: 'rtm.src.rtmActiveTxnList'              ,   GPIDX: '1'    },
        { ID: 'M_rtmTransactionMonitor',      PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Transaction Monitor'),                      cls: 'rtm.src.rtmTransactionMonitor'         ,   GPIDX: '2'    },
        { ID: 'M_rtmPerformanceStat',         PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Performance Stat'),                         cls: 'rtm.src.rtmPerformanceStat'            ,   GPIDX: '3'    },
        { ID: 'M_rtmConcurrentUserStat',      PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Concurrent Users Stat'),                    cls: 'rtm.src.rtmConcurrentUserStat'         ,   GPIDX: '3'    },
        { ID: 'M_rtmPerformanceTotalStat',    PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Performance Total Stat'),                   cls: 'rtm.src.rtmPerformanceTotalStat'       ,   GPIDX: '3'    },
        //{ ID: 'M_rtmServiceStat',             PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Service Stat'),                             cls: 'rtm.src.rtmServiceStat'                ,   GPIDX: '4',   },
        { ID: 'M_rtmServiceStatTrend',        PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Service Stat'),                             cls: 'rtm.src.rtmServiceStatTrend'           ,   GPIDX: '4'    },
        { ID: 'M_rtmVisitorCounter',          PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Today Visitor Count'),                      cls: 'rtm.src.rtmVisitorCounter'             ,   GPIDX: '4'    },
        { ID: 'M_rtmTxnExecutionCount',       PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Today Transaction Execution Count'),        cls: 'rtm.src.rtmTxnExecutionCount'          ,   GPIDX: '4'    },
        { ID: 'M_rtmAlertInfo',               PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Alarm Info'),                               cls: 'rtm.src.rtmAlertInfo'                  ,   GPIDX: '5'    },
        { ID: 'M_rtmAlertLight',              PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Alarm Log History'),                        cls: 'rtm.src.rtmAlertLight'                 ,   GPIDX: '5'    },
        { ID: 'M_rtmGCStat',                  PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('GC Stat'),                                  cls: 'rtm.src.rtmGCStat'                     ,   GPIDX: '6'    },
        //{ ID: 'M_rtmUsageCpu',                PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('CPU Usage'),                                cls: 'rtm.src.rtmUsageCpu'                   ,   GPIDX: '6'    },
        { ID: 'M_rtmUsageOSCpu',              PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('OS CPU Usage'),                             cls: 'rtm.src.rtmUsageOSCpu'                 ,   GPIDX: '6'    },
        { ID: 'M_rtmUsageJVMCpu',             PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('JVM CPU Usage'),                            cls: 'rtm.src.rtmUsageJVMCpu'                ,   GPIDX: '6'    },
        { ID: 'M_rtmConnectionPool',          PGID: 'Realtime1',   STYPE: 'WAS',    text: common.Util.TR('Connection Pool Monitor'),                  cls: 'rtm.src.rtmConnectionPool'             ,   GPIDX: '6'    },
        { ID: 'M_rtmDatabase',                PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('DB Statistics'),                            cls: 'rtm.src.rtmDatabase'                   ,   GPIDX: '7'    },
        { ID: 'M_rtmActiveTxnLockTree',       PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Lock Tree'),                                cls: 'rtm.src.rtmActiveTxnLockTree'          ,   GPIDX: '7'    },
        { ID: 'M_rtmActiveTxnRemoteTree',     PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Remote Tree'),                              cls: 'rtm.src.rtmActiveTxnRemoteTree'        ,   GPIDX: '8'    },
        { ID: 'M_rtmTopTransaction',          PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Realtime TOP Transaction'),                 cls: 'rtm.src.rtmTopTransaction'             ,   GPIDX: '9'    },
        { ID: 'M_rtmTopSQL',                  PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Realtime TOP SQL'),                         cls: 'rtm.src.rtmTopSQL'                     ,   GPIDX: '9'    },
        { ID: 'M_rtmTablespaceUsage',         PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Tablespace Usage'),                         cls: 'rtm.src.rtmTablespaceUsage'            ,   GPIDX: '9'    },
        { ID: 'M_rtmAgentList',               PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Agent List'),                               cls: 'rtm.src.rtmAgentList'                  ,   GPIDX: '10'   },
        { ID: 'M_rtmDiskUsage',               PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Disk Usage'),                               cls: 'rtm.src.rtmDiskUsage'                  ,   GPIDX: '11'   },
        { ID: 'M_rtmProcessStatus',           PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Process Status'),                           cls: 'rtm.src.rtmProcessStatus'              ,   GPIDX: '11'   },
        { ID: 'M_rtmMemoryLeakList',          PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Realtime Memory Leak Trace'),               cls: 'rtm.src.rtmMemoryLeakList'             ,   GPIDX: '11'   },
        { ID: 'M_rtmBizGroupMetrics',         PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Business Group Performance Metrics'),       cls: 'rtm.src.rtmBizGroupPerformanceMetrics' ,   GPIDX: '11'   },
        { ID: 'M_rtmMajorTransactionList',    PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('Major Transaction Elapse Time Statistics'), cls: 'rtm.src.rtmMajorTxnList'               ,   GPIDX: '11'   },
        { ID: 'M_rtmAPMonitor',               PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('AP Monitor'),                               cls: 'rtm.src.rtmAPMonitor'                  ,   GPIDX: '12'   },
        { ID: 'M_rtmAPSummary',               PGID: 'Realtime2',   STYPE: 'WAS',    text: common.Util.TR('AP Summary'),                               cls: 'rtm.src.rtmAPSummary'                  ,   GPIDX: '12'   },

        // AI
        // { ID: 'M_rtmLoadPredict',             PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('WAS Load Prediction'),                   cls: 'rtm.src.rtmLoadPredict'                ,   GPIDX: '1'   },
        // { ID: 'M_rtmDBLoadPredict',           PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('DB Load Prediction'),                    cls: 'rtm.src.rtmDBLoadPredict'              ,   GPIDX: '1'   },
        // { ID: 'M_rtmTxnLoadPredict',          PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Transaction Load Prediction'),           cls: 'rtm.src.rtmTxnLoadPredict'             ,   GPIDX: '1'   },
        // { ID: 'M_rtmBizLoadPredict',          PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Business Load Prediction'),              cls: 'rtm.src.rtmBizLoadPredict'             ,   GPIDX: '1'   },
        // { ID: 'M_rtmAnomalyDetection',        PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Anomaly Detection'),                     cls: 'rtm.src.rtmAnomalyDetection'           ,   GPIDX: '1'   },
        // { ID: 'M_rtmDBAnomalyDetection',      PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('DB Anomaly Detection'),                  cls: 'rtm.src.rtmDBAnomalyDetection'         ,   GPIDX: '1'   },

        { ID: 'M_rtmDashLoadPredict',         PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('WAS Load Prediction'),                   cls: 'rtm.src.rtmDashLoadPredict'            ,   GPIDX: '1'   },
        { ID: 'M_rtmDashTxnLoadPredict',      PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Transaction Load Prediction'),           cls: 'rtm.src.rtmDashTxnLoadPredict'         ,   GPIDX: '1'   },
        { ID: 'M_rtmDashTxnLoadPredict1',     PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Transaction Load Prediction'),           cls: 'rtm.src.rtmDashTxnLoadPredict1'        ,   GPIDX: '1'   },
        { ID: 'M_rtmDashTxnLoadPredict2',     PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Transaction Load Prediction'),           cls: 'rtm.src.rtmDashTxnLoadPredict2'        ,   GPIDX: '1'   },
        { ID: 'M_rtmDashTxnLoadPredict3',     PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Transaction Load Prediction'),           cls: 'rtm.src.rtmDashTxnLoadPredict3'        ,   GPIDX: '1'   },
        { ID: 'M_rtmDashLoadPredictMCA',      PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Load Prediction MCA'),                   cls: 'rtm.src.rtmDashLoadPredictMCA'         ,   GPIDX: '1'   },
        { ID: 'M_rtmDashLoadPredictCBS',      PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Load Prediction CBS'),                   cls: 'rtm.src.rtmDashLoadPredictCBS'         ,   GPIDX: '1'   },
        { ID: 'M_rtmDashLoadPredictFEP',      PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Load Prediction FEP'),                   cls: 'rtm.src.rtmDashLoadPredictFEP'         ,   GPIDX: '1'   },
        { ID: 'M_rtmDashboardAlarm',          PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('Alarm'),                                 cls: 'rtm.src.rtmDashboardAlarm'             ,   GPIDX: '1'   },
        { ID: 'M_rtmDashboardInstanceInfo',   PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('인스턴스 정보'),                            cls: 'rtm.src.rtmDashboardInstanceInfo'      ,   GPIDX: '1'   },
        { ID: 'M_rtmDashAbnormalStatSummary', PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('이상 지표 요약'),                           cls: 'rtm.src.rtmDashAbnormalStatSummary'    ,   GPIDX: '1'   },
        { ID: 'M_rtmDashAbnormalStatInfo',    PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('이상 지표 정보'),                           cls: 'rtm.src.rtmDashAbnormalStatInfo'       ,   GPIDX: '1'   },
        { ID: 'M_rtmDashAbnormalLogInfo',     PGID: 'RealtimeAI',  STYPE: 'WAS',    text: common.Util.TR('이상 로그 정보'),                           cls: 'rtm.src.rtmDashAbnormalLogInfo'       ,   GPIDX: '1'   },

        // TP
        { ID: 'M_TPTrend',                    PGID: 'Panalysis',   STYPE: 'TP',     text: common.Util.TR('Performance Trend'),                     cls: 'view.TPTrend'                    },
        { ID: 'M_TPTransactionTrend',         PGID: 'Panalysis',   STYPE: 'TP',     text: common.Util.TR('Transaction Trend'),                     cls: 'view.TPResponseInspector'        },
        { ID: 'M_TPDBTrend',                  PGID: 'Panalysis',   STYPE: 'TP',     text: common.Util.TR('DB Trend'),                              cls: 'view.DBTrend'                    },
        { ID: 'M_TPComparisonTrend',          PGID: 'Panalysis',   STYPE: 'TP',     text: common.Util.TR('Performance Comparison Analysis'),       cls: 'view.TPComparisonTrend'          },
        { ID: 'M_TPElapseDistribution',       PGID: 'Panalysis',   STYPE: 'TP',     text: common.Util.TR('Elapse Distribution'),                   cls: 'view.TPElapseDistribution'       },
        { ID: 'M_TPSlogRetrieve',             PGID: 'Panalysis',   STYPE: 'TP',     text: common.Util.TR('Slog Retrieve'),                         cls: 'view.TPSlogRetrieve'             },

        { ID: 'M_TPTopTransaction',           PGID: 'Pstatistics', STYPE: 'TP',     text: common.Util.TR('TOP Transaction Summary'),               cls: 'view.TOPTransaction'             },
        { ID: 'M_TPTopSQL',                   PGID: 'Pstatistics', STYPE: 'TP',     text: common.Util.TR('TOP SQL Summary'),                       cls: 'view.TopSQL_MIN'                 },
        { ID: 'M_TPTransactionHistory',       PGID: 'Pstatistics', STYPE: 'TP',     text: common.Util.TR('Transaction Summary'),                   cls: 'view.TPTxnHistory'               },
        { ID: 'M_TPSQLHistory',               PGID: 'Pstatistics', STYPE: 'TP',     text: common.Util.TR('SQL Summary'),                           cls: 'view.TPSQLHistory'               },
        { ID: 'M_TPAlertHistory',             PGID: 'Pstatistics', STYPE: 'TP',     text: common.Util.TR('Alert Summary'),                         cls: 'view.AlertHistory'               },
        { ID: 'M_TPEtoEResponseTrend',        PGID: 'Pstatistics', STYPE: 'TP',     text: common.Util.TR('EtoE Response Trend'),                   cls: 'view.EtoEResponseTrend'          },

        { ID: 'M_TPdashRealtimeMonitor',      PGID: 'Dashboard',   STYPE: 'TP',     text: common.Util.TR('RealTime Monitor (Default)'),             cls: 'dashboard.TPMonitor'       },
        { ID: 'M_dashTPtmadminMonitor',       PGID: 'Dashboard',   STYPE: 'TP',     text: common.Util.TR('tmadmin Monitoring'),                    cls: 'dashboard.TPtmadminMonitor'      },


        { ID: 'M_rtmTPActivityMonitor',       PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Activity Monitor'),                      cls: 'rtm.src.rtmTPActivityMonitor'          ,    GPIDX: '1'   },
        { ID: 'M_rtmTPActiveTxnCount',        PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Active Transaction Count'),              cls: 'rtm.src.rtmTPActiveTxnCount'           ,    GPIDX: '1'   },
        { ID: 'M_rtmTPUsageCpu',              PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('CPU Usage'),                             cls: 'rtm.src.rtmTPUsageCpu'                 ,    GPIDX: '1'   },
        { ID: 'M_rtmTPTransactionMonitor',    PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Transaction Monitor'),                   cls: 'rtm.src.rtmTPTransactionMonitor'       ,    GPIDX: '1'   },
        { ID: 'M_rtmTPActiveTxnList',         PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Active Transaction'),                    cls: 'rtm.src.rtmTPActiveTxnList'            ,    GPIDX: '1'   },
        { ID: 'M_rtmTPActiveTxnRemoteTree',   PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Remote Tree'),                           cls: 'rtm.src.rtmActiveTxnRemoteTree'        ,    GPIDX: '1'   },
        { ID: 'M_rtmTPTrendStat',             PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Performance Stat'),                      cls: 'rtm.src.rtmTPTrendStat'                ,    GPIDX: '1'   },
        { ID: 'M_rtmTPAlertInfo',             PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Alarm Info'),                            cls: 'rtm.src.rtmTPAlertInfo'                ,    GPIDX: '1'   },
        { ID: 'M_rtmTPAlertLight',            PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Alarm Log History'),                     cls: 'rtm.src.rtmTPAlertLight'               ,    GPIDX: '1'   },
        { ID: 'M_rtmTPTopTransaction',        PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Realtime TOP Transaction'),              cls: 'rtm.src.rtmTPTopTransaction'           ,    GPIDX: '1'   },
        { ID: 'M_rtmTPTopSQL',                PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Realtime TOP SQL'),                      cls: 'rtm.src.rtmTPTopSQL'                   ,    GPIDX: '1'   },
        { ID: 'M_rtmTPDiskUsage',             PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Disk Usage'),                            cls: 'rtm.src.rtmTPDiskUsage'                ,    GPIDX: '1'   },
        { ID: 'M_rtmTPTmadmin',               PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('Realtime tmadmin'),                      cls: 'rtm.src.rtmTPTmadmin'                  ,    GPIDX: '1'   },
        { ID: 'M_rtmTPSlog',                  PGID: 'RealtimeTP',  STYPE: 'TP',     text: common.Util.TR('TP Slog'),                               cls: 'rtm.src.rtmTPSlog'                     ,    GPIDX: '1'   },

        // Tuxedo
        { ID: 'M_TuxTrend',                    PGID: 'Panalysis',   STYPE: 'TUX',    text: common.Util.TR('Performance Trend'),                     cls: 'view.TuxTrend'                    },
        { ID: 'M_TuxTransactionTrend',         PGID: 'Panalysis',   STYPE: 'TUX',    text: common.Util.TR('Transaction Trend'),                     cls: 'view.TuxResponseInspector'        },
        { ID: 'M_TuxDBTrend',                  PGID: 'Panalysis',   STYPE: 'TUX',    text: common.Util.TR('DB Trend'),                              cls: 'view.DBTrend'                    },
        { ID: 'M_TuxComparisonTrend',          PGID: 'Panalysis',   STYPE: 'TUX',    text: common.Util.TR('Performance Comparison Analysis'),       cls: 'view.TuxComparisonTrend'          },
        { ID: 'M_TuxElapseDistribution',       PGID: 'Panalysis',   STYPE: 'TUX',    text: common.Util.TR('Elapse Distribution'),                   cls: 'view.TuxElapseDistribution'       },
        { ID: 'M_TuxULOGRetrieve',             PGID: 'Panalysis',   STYPE: 'TUX',    text: common.Util.TR('ULOG Retrieve'),                         cls: 'view.TuxULOGRetrieve'             },

        { ID: 'M_TuxTopTransaction',           PGID: 'Pstatistics', STYPE: 'TUX',    text: common.Util.TR('TOP Transaction Summary'),               cls: 'view.TOPTransaction'             },
        { ID: 'M_TuxTopSQL',                   PGID: 'Pstatistics', STYPE: 'TUX',    text: common.Util.TR('TOP SQL Summary'),                       cls: 'view.TopSQL_MIN'                 },
        { ID: 'M_TuxTransactionHistory',       PGID: 'Pstatistics', STYPE: 'TUX',    text: common.Util.TR('Transaction Summary'),                   cls: 'view.TuxTxnHistory'               },
        { ID: 'M_TuxSQLHistory',               PGID: 'Pstatistics', STYPE: 'TUX',    text: common.Util.TR('SQL Summary'),                           cls: 'view.TuxSQLHistory'               },
        { ID: 'M_TuxAlertHistory',             PGID: 'Pstatistics', STYPE: 'TUX',    text: common.Util.TR('Alert Summary'),                         cls: 'view.AlertHistory'               },
        { ID: 'M_TuxEtoEResponseTrend',        PGID: 'Pstatistics', STYPE: 'TUX',    text: common.Util.TR('EtoE Response Trend'),                   cls: 'view.EtoEResponseTrend'          },

        { ID: 'M_rtmTuxActivityMonitor',       PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Activity Monitor'),                      cls: 'rtm.src.rtmTuxActivityMonitor'          ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxActiveTxnCount',        PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Active Transaction Count'),              cls: 'rtm.src.rtmTuxActiveTxnCount'           ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxUsageCpu',              PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('CPU Usage'),                             cls: 'rtm.src.rtmTuxUsageCpu'                 ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxTransactionMonitor',    PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Transaction Monitor'),                   cls: 'rtm.src.rtmTuxTransactionMonitor'       ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxActiveTxnList',         PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Active Transaction'),                    cls: 'rtm.src.rtmTuxActiveTxnList'            ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxActiveTxnRemoteTree',   PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Remote Tree'),                           cls: 'rtm.src.rtmActiveTxnRemoteTree'         ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxTrendStat',             PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Performance Stat'),                      cls: 'rtm.src.rtmTuxTrendStat'                ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxAlertInfo',             PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Alarm Info'),                            cls: 'rtm.src.rtmTuxAlertInfo'                ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxAlertLight',            PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Alarm Log History'),                     cls: 'rtm.src.rtmTuxAlertLight'               ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxTopTransaction',        PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Realtime TOP Transaction'),              cls: 'rtm.src.rtmTuxTopTransaction'           ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxTopSQL',                PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Realtime TOP SQL'),                      cls: 'rtm.src.rtmTuxTopSQL'                   ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxDiskUsage',             PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Disk Usage'),                            cls: 'rtm.src.rtmTuxDiskUsage'                ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxTmadmin',               PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Realtime tmadmin'),                      cls: 'rtm.src.rtmTuxTmadmin'                  ,    GPIDX: '1'   },
        { ID: 'M_rtmTuxULOG',                  PGID: 'RealtimeTUX',  STYPE: 'TUX',   text: common.Util.TR('Tuxedo ULOG'),                           cls: 'rtm.src.rtmTuxULOG'                     ,    GPIDX: '1'   },

        // WEB
        { ID: 'M_WebTrend',                   PGID: 'Panalysis',   STYPE: 'WEB',    text: common.Util.TR('Performance Trend'),                     cls: 'view.WebTrend'                   },
        { ID: 'M_WebTransactionTrend',        PGID: 'Panalysis',   STYPE: 'WEB',    text: common.Util.TR('Transaction Trend'),                     cls: 'view.WebResponseInspector'       },
        { ID: 'M_WebComparisonTrend',         PGID: 'Panalysis',   STYPE: 'WEB',    text: common.Util.TR('Performance Comparison Analysis'),       cls: 'view.WebComparisonTrend'         },
        { ID: 'M_WebElapseDistribution',      PGID: 'Panalysis',   STYPE: 'WEB',    text: common.Util.TR('Elapse Distribution'),                   cls: 'view.WebElapseDistribution'      },

        { ID: 'M_WebTopTransaction',          PGID: 'Pstatistics', STYPE: 'WEB',    text: common.Util.TR('TOP Transaction Summary'),               cls: 'view.WebTOPTransaction'          },
        { ID: 'M_WebTransactionHistory',      PGID: 'Pstatistics', STYPE: 'WEB',    text: common.Util.TR('Transaction Summary'),                   cls: 'view.WebTxnHistory'              },
        { ID: 'M_WebStatsByResponseCode',     PGID: 'Pstatistics', STYPE: 'WEB',    text: common.Util.TR('Statistics by Response Code'),           cls: 'view.StatsByResponseCode'        },
        { ID: 'M_WebWASWorkloadHistory',      PGID: 'Pstatistics', STYPE: 'WEB',    text: common.Util.TR('Agent Workload Summary'),                cls: 'view.WebWASWorkload'             },
        { ID: 'M_WebAlertHistory',            PGID: 'Pstatistics', STYPE: 'WEB',    text: common.Util.TR('Alert Summary'),                         cls: 'view.AlertHistory'               },
        { ID: 'M_WebClientHistory',           PGID: 'Pstatistics', STYPE: 'WEB',    text: common.Util.TR('Client Summary'),                        cls: 'view.ClientHistory'              },

        { ID: 'M_rtmWebActivityMonitor',      PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Activity Monitor'),                      cls: 'rtm.src.rtmWebActivityMonitor'         ,    GPIDX: '1'   },
        { ID: 'M_rtmWebActiveTxnCount',       PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Active Transaction Count'),              cls: 'rtm.src.rtmWebActiveTxnCount'          ,    GPIDX: '1'   },
        { ID: 'M_rtmWebTransactionMonitor',   PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Transaction Monitor'),                   cls: 'rtm.src.rtmWebTransactionMonitor'      ,    GPIDX: '1'   },
        { ID: 'M_rtmWebActiveTxnList',        PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Active Transaction'),                    cls: 'rtm.src.rtmWebActiveTxnList'           ,    GPIDX: '1'   },
        { ID: 'M_rtmWebTrendStat',            PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Performance Stat'),                      cls: 'rtm.src.rtmWebTrendStat'               ,    GPIDX: '1'   },
        { ID: 'M_rtmWebAlertInfo',            PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Alarm Info'),                            cls: 'rtm.src.rtmWebAlertInfo'               ,    GPIDX: '1'   },
        { ID: 'M_rtmWebAlertLight',           PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Alarm Log History'),                     cls: 'rtm.src.rtmWebAlertLight'              ,    GPIDX: '1'   },
        { ID: 'M_rtmWebResponseStatus',       PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Response Status Code'),                  cls: 'rtm.src.rtmWebResponseStatus'          ,    GPIDX: '1'   },
        { ID: 'M_rtmWebVisitorCounter',       PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('Today Visitor Count'),                   cls: 'rtm.src.rtmWebVisitorCounter'          ,    GPIDX: '1'   },
        { ID: 'M_rtmWebadmin',                PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('wsadmin'),                               cls: 'rtm.src.rtmWebadmin'                   ,    GPIDX: '1'   },
        { ID: 'M_rtmWebBlockRun',             PGID: 'RealtimeWeb', STYPE: 'WEB',    text: common.Util.TR('BlockRun'),                              cls: 'rtm.src.rtmWebBlockRun'                ,    GPIDX: '1'   },

        // C Daemon
        { ID: 'M_CDTrend',                    PGID: 'Panalysis',   STYPE: 'CD',     text: common.Util.TR('Performance Trend'),                     cls: 'view.CDTrend'                    },
        { ID: 'M_CDTransactionTrend',         PGID: 'Panalysis',   STYPE: 'CD',     text: common.Util.TR('Transaction Trend'),                     cls: 'view.CDResponseInspector'        },
        { ID: 'M_CDComparisonTrend',          PGID: 'Panalysis',   STYPE: 'CD',     text: common.Util.TR('Performance Comparison Analysis'),       cls: 'view.CDComparisonTrend'          },
        { ID: 'M_CDElapseDistribution',       PGID: 'Panalysis',   STYPE: 'CD',     text: common.Util.TR('Elapse Distribution'),                   cls: 'view.CDElapseDistribution'       },

        { ID: 'M_CDTopTransaction',           PGID: 'Pstatistics', STYPE: 'CD',     text: common.Util.TR('TOP Transaction Summary'),               cls: 'view.CDTOPTransaction'           },
        { ID: 'M_CDTransactionHistory',       PGID: 'Pstatistics', STYPE: 'CD',     text: common.Util.TR('Transaction Summary'),                   cls: 'view.CDTxnHistory'               },
        { ID: 'M_CDWASWorkloadHistory',       PGID: 'Pstatistics', STYPE: 'CD',     text: common.Util.TR('Agent Workload Summary'),                cls: 'view.CDWASWorkload'              },
        { ID: 'M_CDAlertHistory',             PGID: 'Pstatistics', STYPE: 'CD',     text: common.Util.TR('Alert Summary'),                         cls: 'view.AlertHistory'               },
        { ID: 'M_CDDailySummary',             PGID: 'Pstatistics', STYPE: 'CD',     text: common.Util.TR('One-day Summary'),                       cls: 'view.CDDailySummary'             },

        { ID: 'M_rtmCDActivityMonitor',       PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Activity Monitor'),                      cls: 'rtm.src.rtmCDActivityMonitor'    },
        { ID: 'M_rtmCDTransactionMonitor',    PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Transaction Monitor'),                   cls: 'rtm.src.rtmCDTransactionMonitor' },
        { ID: 'M_rtmCDTrendStat',             PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Performance Stat'),                      cls: 'rtm.src.rtmCDTrendStat'          },
        { ID: 'M_rtmCDAlertInfo',             PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Alarm Info'),                            cls: 'rtm.src.rtmCDAlertInfo'          },
        { ID: 'M_rtmCDAlertLight',            PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Alarm Log History'),                     cls: 'rtm.src.rtmCDAlertLight'         },
        { ID: 'M_rtmCDUsageOSCpu',            PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('OS CPU Usage'),                          cls: 'rtm.src.rtmCDUsageOSCpu'         },
        { ID: 'M_rtmCDTopTransaction',        PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Realtime TOP Transaction'),              cls: 'rtm.src.rtmCDTopTransaction'     },
        { ID: 'M_rtmCDTopSQL',                PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Realtime TOP SQL'),                      cls: 'rtm.src.rtmCDTopSQL'             },
        { ID: 'M_rtmCDDiskUsage',             PGID: 'RealtimeCD',  STYPE: 'CD',     text: common.Util.TR('Disk Usage'),                            cls: 'rtm.src.rtmCDDiskUsage'          },

        // EtoE
        //{ ID: 'M_E2ETransactionTrend',        PGID: 'Panalysis2',  STYPE: 'E2E',    text: common.Util.TR('ETE Transaction Trend'),                 cls: 'view.ResponseInspector'          },
        //{ ID: 'M_E2EResponseTrend',           PGID: 'Panalysis2',  STYPE: 'E2E',    text: common.Util.TR('Response Trend'),                        cls: 'view.EtoEResponseTrend'          },
        { ID: 'M_E2EAlertHistory',            PGID: 'Panalysis2',  STYPE: 'E2E',    text: common.Util.TR('Alert Summary'),                         cls: 'view.AlertHistory'               },
        { ID: 'M_E2EElapseDistribution',      PGID: 'Panalysis2',  STYPE: 'E2E',    text: 'EtoE ' + common.Util.TR('Elapse Distribution'),         cls: 'view.EtoEElapseDistribution'     },
        { ID: 'M_E2EResponseTime',            PGID: 'Panalysis2',  STYPE: 'E2E',    text: common.Util.TR('EtoE Response Time'),                    cls: 'view.EtoEResponseTime'           },
        //{ ID: 'M_ClientHistory',              PGID: 'Panalysis2',  STYPE: 'E2E',    text: common.Util.TR('ETE Client Summary'),                    cls: 'view.ClientHistory'              },

        // Configuration
        { ID: 'M_Configuration',              PGID: '',            STYPE: 'ALL',    text: common.Util.TR('Configuration'),                         cls: 'config.config'                   },


        // 사용 x 컴포넌트 추후 사용될 수도 있음.
        { ID: 'M_rtmTxnEtoEExecutionCount',   PGID: 'RealtimeBiz',   STYPE: 'biz',    text: common.Util.TR('Business Service Stat'),                cls: 'rtm.src.rtmBizServiceStatTrend'  },
        { ID: 'M_rtmBizActiveTxnCount',       PGID: 'RealtimeBiz',   STYPE: 'biz',    text: common.Util.TR('Business Active Transaction Count'),    cls: 'rtm.src.rtmBizActiveTxnCount'    }
    ],

    mainMenuDesc : [
        //Performance Analysis
        { ID: 'M_AllPerformanceTrend'       ,  desc :common.Util.TR('Provides a graphical representation of performance trends for multiple instances over a specific time period. Analyze performance metrics over time for multiple instances. In addition, if detailed analysis of a specific instance is required, it provides link to the performance trend analysis screen.') },
        { ID: 'M_PerformanceTrend'          ,  desc :common.Util.TR('Performance information of each WAS and related DB will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active transactions for the time.') },
        { ID: 'M_TransactionTrend'          ,  desc :common.Util.TR('Both static transaction response time chart for the specified period and another transaction response time chart dynamically updated in real time will be displayed at the same time. And transaction detail will be shown by double-clicking a transaction from the grid.') },
        { ID: 'M_DBTrend'                   ,  desc :common.Util.TR('Database performance information will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active sessions for the time.') },
        { ID: 'M_StackDumpViewer'           ,  desc :common.Util.TR('Detail data of Java thread dump.') },
        { ID: 'M_DiffSource'                ,  desc :common.Util.TR('You can view decompiled java source code for class files, change history of class files and differences side by side between two java class files.') },
        { ID: 'M_EnvDiff'                   ,  desc :common.Util.TR('Environment settings will be retrieved and they could be analyzed by comparing two sources.') },
        { ID: 'M_ClientResponseTime'        ,  desc :common.Util.TR('Can monitor response time per display or service in XPlatform environment.Response time is segmented into client and server sections to track down issues.') },
        { ID: 'M_ClientViewResponseTime'    ,  desc :common.Util.TR('Can monitor response time per display or service in XPlatform environment.Response time is segmented into client and server sections to track down issues.') },
        { ID: 'M_ComparisonTrend'           ,  desc :common.Util.TR('Performance Comparison Analysis Performance of different WASs on different dates can be compared and analyzed.') },
        { ID: 'M_ElapseDistribution'        ,  desc :common.Util.TR('Provides a scatter plot of Transaction Elapsed Time vs. Transaction End Time. The dots will appear red, if any exceptions occurred. Drag an area to get detailed information about the selected transactions.') },
        { ID: 'M_TxnRankingAnalysis'        ,  desc :common.Util.TR('Provides transaction rankings by average elapsed times or execution counts on selected dates. Changes in rankings are analyzed 1:N or N:M.') },
        { ID: 'M_SqlRankingAnalysis'        ,  desc :common.Util.TR('Provides SQL rankings by average elapsed times, execution counts, DB CPU levels, logical read counts or physical read count on selected dates. Changes in rankings are analyzed 1:N or N:M.') },
        { ID: 'M_MemoryLeakTracking'        ,  desc :common.Util.TR('Provides information about the fluctuation of abnormal data usage of collection objects for memory leak tracing. It provides transaction analysis, stack trace, and related transaction information at the same time to provide a cause analysis function to determine which objects in a transaction are using abnormally data when a memory leak or OOM occurs.') },
        { ID: 'M_LoadPatternAnalysis'       ,  desc :common.Util.TR('')},
        //{ ID: 'M_TransactionSQL'            ,  desc :'조회 기간 동안의 트랜잭션별 쿼리 수행 통계 정보를 확인 할 수 있습니다.'},
        //{ ID: 'M_TransactionLeakSuspect'    ,  desc :common.Util.TR('Suspected transaction of memory leak can be identified through the trend chart of memory usage.') },
        //{ ID: 'M_ObjectLeakSuspect'         ,  desc :common.Util.TR('Suspected object of memory leak can be identified through the trend chart of object memory usage. And you can track the transactions using that object.') },

        //Tools
        { ID: 'M_ScriptManager'             ,  desc :common.Util.TR('The tool to build and maintain SQL statements. The result of the SQL query could be chart or grid.') },

        //Performance Statistics
        { ID: 'M_TopTransaction'            ,  desc :common.Util.TR('Most executed or most time consuming transactions will be retrieved with detailed trend chart and also SQL performance data.') },
        { ID: 'M_TopSQL'                    ,  desc :common.Util.TR('TOP 20 SQL statements executed most frequently or having longest elapsed time will be retrieved for the specified time period.') },
        { ID: 'M_TransactionHistory'        ,  desc :common.Util.TR('Summed up transaction performance data and trend charts for every 10 minutes.') },
        { ID: 'M_SQLHistory'                ,  desc :common.Util.TR('Summed up SQL performance data related with or without transactions for every 10 minutes. Also elapse time and value of each bind variables will be shown.') },
        { ID: 'M_ExceptionHistory'          ,  desc :common.Util.TR('Collected java exception data will be shown by exception class and by list with time occurred. And also summarized charts will be drawn.') },
        { ID: 'M_BusinessTxnSummary'        ,  desc :common.Util.TR('Provides performance summary of transaction searched by mapped business names.') },
        { ID: 'M_WASWorkloadHistory'        ,  desc :common.Util.TR('Load balancing information between clustered web application servers.') },
        { ID: 'M_AlertHistory'              ,  desc :common.Util.TR('By hourly or minutely, summarized data of all occurred alerts shown with a chart.') },
        //{ ID: 'M_ClientResponseTrend'       ,  desc :'조회 기간 동안의 구간별 응답 시간 통계 정보를 확인 할 수 있습니다.' },
        { ID: 'M_ClientHistory'             ,  desc :common.Util.TR('The execution count and elapse time of transactions grouped by users\'IP address.') },
        { ID: 'M_EtoEResponseTrend'         ,  desc :common.Util.TR('Each tier\'s average and maximum response time covering from end to end with trend chart and detail data.') },
        { ID: 'M_WebStat'                   ,  desc :common.Util.TR('The execution count and elapse time of transactions grouped by web server. And all statistics data for requested URL and web server alerts.') },
        { ID: 'M_UserResponseTimeSummary'   ,  desc :common.Util.TR('Check the statistics of the ETE view of the client <-> network <-> server section on a transaction basis by measuring the user response time of the client (Web, X-Platform, C etc) Can be.') },
        { ID: 'M_DailySummary'              ,  desc :common.Util.TR('From the daily statistics, you can Drill Down to the trend of specific transactions. Provides statistical information on the number of calls per day, number of visitors, number of errors, provides detailed hourly statistical information on a specific date, and provides detailed information on specific transaction and SQL querie. In addition, if you select a specific transaction and SQL, you can get drill down analysis of performance problem by providing daily and hourly trend information on that transaction and SQL.')},

        //Report
        { ID: 'M_AnalysisReport'            ,  desc :common.Util.TR('Templates for daily, weekly, and monthly reports are available.Performance reports can be generated for each WAS.') },
        { ID: 'M_AnalysisReportConfiguration',  desc :common.Util.TR('You can specify performance reports which you want to view in the form of predefined templates, and receive that reports by e-mail according to the schedule you specify. In addition, you can search the e-mail sending history from the screen.') },

        //Dashboard
        { ID: 'M_dashRealtimeMonitor'       ,  desc : common.Util.TR('Default dashboard which provides detailed active transaction monitoring.') },
        { ID: 'M_dashRealtimeMonitor2'      ,  desc : common.Util.TR('Default dashboard variation without detailed active traction list information.') },
        { ID: 'M_dashRealtimeMonitor3'      ,  desc : common.Util.TR('Integrated dashboard which provides various performance indexes.') },
        { ID: 'M_dashRealtimeMonitor4'      ,  desc : common.Util.TR('Group monitoring dashboard which support summarized activity monitoring on selected server groups.') },
        { ID: 'M_dashManagerView'           ,  desc : common.Util.TR('Business manager monitoring view which supports major transaction status and major performance indexes.') },
        { ID: 'M_dashMultiInstance'         ,  desc : common.Util.TR('Multi-instance view provides real-time load-balance monitoring.') },
        { ID: 'M_dashWasDbView'             ,  desc : common.Util.TR('WAS-DB linked view supports both application monitoring and database monitoring.') },
        { ID: 'M_dashSysResource'           ,  desc : common.Util.TR('System resource view provides system CPU and memory resource monitoring.') },
        { ID: 'M_dashMemory'                ,  desc : common.Util.TR('Memory view provides detailed heap memory monitoring and garbage collection status monitoring.') },
        //{ ID: 'M_dashActiveUser'            ,  desc : common.Util.TR('User view provides user and service status performance monitoring which includes concurrent user, TPS, execution count, etc.') },
        { ID: 'M_dashTopologyView'          ,  desc : common.Util.TR('E2E for all sectors to provide a view that can determine the flow of transactions and system operating conditions in real time.') },
        //{ ID: 'M_dashDBView'                ,  desc : common.Util.TR('') },
        { ID: 'M_dashBusinessView'          ,  desc : common.Util.TR('This is a real-time dashboard that can monitor the performance of each section for each task through definition of whole section.') },
        { ID: 'M_dashBusinessView2'         ,  desc : common.Util.TR('This is a real-time dashboard that allows you to define detailed groupings by task level (large / small / small) and monitor them from various perspectives.') },
        { ID: 'M_dashBusinessViewWas'       ,  desc : common.Util.TR('') },

        //Docking Frame
        { ID: 'M_rtmActivityMonitor'        ,  desc: common.Util.TR('Allows intuitive monitoring of real time service executions by dynamically displaying request rate per second, throughput per second, and number of transactions.') },
        { ID: 'M_rtmActivityGroup'          ,  desc: common.Util.TR('Integrated real-time monitoring window frame for the selected server group. It visualizes active transaction and displays service request rate, response time, concurrent user, number of transactions, number of visitors.') },
        { ID: 'M_rtmActiveTxnCount'         ,  desc: common.Util.TR('Verifies the number of active transaction for multiple servers in real time. Monitors entire service execution status by providing number of active transactions classified according to transaction\'s elapsed time in blue, yellow, and red.') },
        { ID: 'M_rtmActiveTxnGroupCount'    ,  desc: common.Util.TR('Verifies the number of active transaction for multiple server groups in real time. By clicking the specific server group, you can monitor the active transaction of servers in that server group.') },
        { ID: 'M_rtmActiveTxnList'          ,  desc: common.Util.TR('Monitors active transaction\'s detailed performance data of each server every three seconds. Identifies the root cause of delay transaction by providing each transactions\'s elapsed time, execution status, Method execution data, SQL execution data, etc.') },
        { ID: 'M_rtmTransactionMonitor'     ,  desc: common.Util.TR('Provides elapsed time distribution for transactions in real time. Easily identifies the bottleneck and checks method execution details, SQL execution details, and exception occurred details by providing transactions with long elapsed time.') },
        { ID: 'M_rtmPerformanceStat'        ,  desc: common.Util.TR('Displays the most recent trends of performance statistics in graphs. Identifies problem types by providing resource usage rate data and transaction throughput in real time.') },
        { ID: 'M_rtmConcurrentUserStat'     ,  desc: common.Util.TR('Provides a line chart of concurrent user count in the past one hour for each instance.') },
        { ID: 'M_rtmPerformanceTotalStat'   ,  desc: common.Util.TR('Displays the most recent trends of summed performance statistics in graphs. Displays summed value for performance statistics of the selected server.') },
        //{ ID: 'M_rtmServiceStat'            ,  desc: common.Util.TR('Provides performance statistics of overload view point for servers or entire service. Monitors trend changes within 24 hours and compares statistics at the same time from today and the day before.') },
        { ID: 'M_rtmServiceStatTrend'       ,  desc: common.Util.TR('Provides performance statistics of overload view point for servers or entire service. Monitors trend changes within 24 hours and compares statistics at the same time from today and the day before.') },
        { ID: 'M_rtmVisitorCounter'         ,  desc: common.Util.TR('Displays number of visitors who navigated web applications today and yesterday.') },
        { ID: 'M_rtmTxnExecutionCount'      ,  desc: common.Util.TR('Displays number of transactions executed today and yesterday.') },
        { ID: 'M_rtmAlertInfo'              ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmAlertLight'             ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmGCStat'                 ,  desc: common.Util.TR('Provides statistics showing Heap memory of each server. Analyzes memory usage and related problems in real time through providing each area of Heap memory usage rate, garbage collection elapsed time, number of executions, and number of class loading.') },
        //{ ID: 'M_rtmUsageCpu'               ,  desc: common.Util.TR('CPU Usage window frame displays CPU usage of monitoring target servers.') },
        { ID: 'M_rtmUsageOSCpu'             ,  desc: common.Util.TR('CPU Usage window frame displays CPU usage of monitoring target servers.') },
        { ID: 'M_rtmUsageJVMCpu'            ,  desc: common.Util.TR('CPU Usage window frame displays CPU usage of monitoring target servers.') },
        { ID: 'M_rtmConnectionPool'         ,  desc: common.Util.TR('Provides total number and usage data of connection pools created in each server.') },
        { ID: 'M_rtmDatabase'               ,  desc: common.Util.TR('Verifies DB status, real time resource usage rate data, and performance data of targeted DB.') },
        { ID: 'M_rtmActiveTxnLockTree'      ,  desc: common.Util.TR('Provides details of Lock occurred in DB. Analyzes by linking transaction data that called out SQL and providing a tree composed of Lock Holder and Waiter.') },
        { ID: 'M_rtmActiveTxnRemoteTree'    ,  desc: common.Util.TR('Provides tree displaying transaction details and paths in real time for End-to-End perspective. Easily identifies problem tier and transaction occurred at that time.') },
        { ID: 'M_rtmTopTransaction'         ,  desc: common.Util.TR('Provides statistics of most time consuming transactions based on the average elapsed time of transactions within last hour.') },
        { ID: 'M_rtmTopSQL'                 ,  desc: common.Util.TR('Provides statistics of most time consuming SQL based on the average elapsed time of SQL within last hour.') },
        { ID: 'M_rtmTablespaceUsage'        ,  desc: common.Util.TR('Verifies tablespace usage for targeted monitoring DB.') },
        { ID: 'M_rtmAgentList'              ,  desc: common.Util.TR('Agent List window frame provides the function of selecting monitoring target servers. By clicking target server, only selected.') },
        { ID: 'M_rtmDiskUsage'              ,  desc: common.Util.TR('Displays disk I/O status of monitored servers.') },
        { ID: 'M_rtmProcessStatus'          ,  desc: common.Util.TR('Displays process status of monitored servers.') },
        { ID: 'M_rtmMemoryLeakList'         ,  desc: common.Util.TR('Monitor unusual data usage of detected collection objects in a J2EE container in real time. Provides transaction information and detailed stack trace information that caused memory leaks for real-time analysis, and provides memory usage trend of individual collection objects in real time.') },
        { ID: 'M_rtmBizGroupMetrics'        ,  desc :common.Util.TR('Provides performance metrics (concurrent user count, transaction process count per second, and average transaction elapsed time) of business groups in real-time.')},
        { ID: 'M_rtmMajorTransactionList'   ,  desc :common.Util.TR('Provides major transactions’ most recent elapsed time and their differences compared to the base data.')},
        { ID: 'M_rtmAPMonitor'              ,  desc :common.Util.TR('Provides error-code and error-message by mapped business names.') },
        { ID: 'M_rtmAPSummary'              ,  desc :common.Util.TR('Provides summary of error-code and error-message per applications.') },
        { ID: 'M_rtmIntegrationTracking'    ,  desc :common.Util.TR('Provides summary of error-code and error-message per applications.') },
        { ID: 'M_rtmLoadPredict'            ,  desc : common.Util.TR('') },
        { ID: 'M_rtmDBLoadPredict'          ,  desc : common.Util.TR('') },
        { ID: 'M_rtmTxnLoadPredict'         ,  desc : common.Util.TR('') },
        { ID: 'M_rtmBizLoadPredict'         ,  desc : common.Util.TR('') },
        { ID: 'M_rtmAnomalyDetection'       ,  desc : common.Util.TR('') },
        { ID: 'M_rtmDBAnomalyDetection'     ,  desc : common.Util.TR('') },
        //{ ID: 'M_rtmAlert'                  ,  desc: common.Util.TR('Provides the number of alert types to the last 10 minutes. Verifies the details of alerts occurred in each server.') },
        //{ ID: 'M_rtmLockWaitSession'        ,  desc: common.Util.TR('Lock Waiting Session Count')  },
        //{ ID: 'M_rtmDailyProcessing'        ,  desc: common.Util.TR('Daily Processing')            },
        //{ ID: 'M_rtmProcessingTimeline'     ,  desc: common.Util.TR('Processing Timeline')         },
        //{ ID: 'M_rtmSystemStatus'           ,  desc: common.Util.TR('System Status')               },
        //{ ID: 'M_RealtimeMonitor'           ,  desc :'전 구간의 서비스 수행 상태를 실시간으로 모니터링하여 장애 및 성능 지연현상을 감지할 수 있습니다.' },
        //{ ID: 'M_ProcessMonitor'            ,  desc :'서버별 CPU, Memory 사용률 기준 TOP 프로세스 리스트를 실시간으로 확인 할 수 있습니다.' },

        // TP
        //Performance Analysis
        { ID: 'M_TPTrend'                   ,  desc :common.Util.TR('Performance information of each WAS and related DB will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active transactions for the time.') },
        { ID: 'M_TPTransactionTrend'        ,  desc :common.Util.TR('Both static transaction response time chart for the specified period and another transaction response time chart dynamically updated in real time will be displayed at the same time. And transaction detail will be shown by double-clicking a transaction from the grid.') },
        { ID: 'M_TPDBTrend'                 ,  desc :common.Util.TR('Database performance information will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active sessions for the time.') },

        //Performance Statistics
        { ID: 'M_TPTopTransaction'          ,  desc :common.Util.TR('Most executed or most time consuming transactions will be retrieved with detailed trend chart and also SQL performance data.') },
        { ID: 'M_TPTopSQL'                  ,  desc :common.Util.TR('TOP 20 SQL statements executed most frequently or having longest elapsed time will be retrieved for the specified time period.') },
        { ID: 'M_TPAlertHistory'            ,  desc :common.Util.TR('By hourly or minutely, summarized data of all occurred alerts shown with a chart.') },
        { ID: 'M_TPEtoEResponseTrend'       ,  desc :common.Util.TR('Each tier\'s average and maximum response time covering from end to end with trend chart and detail data.') },

        //Docking Frame
        { ID: 'M_rtmTPActivityMonitor'      ,  desc: common.Util.TR('Allows intuitive monitoring of real time service executions by dynamically displaying request rate per second, throughput per second, and number of transactions.') },
        { ID: 'M_rtmTPActiveTxnCount'       ,  desc: common.Util.TR('Verifies the number of active transaction for multiple servers in real time. Monitors entire service execution status by providing number of active transactions classified according to transaction\'s elapsed time in blue, yellow, and red.') },
        { ID: 'M_rtmTPUsageCpu'             ,  desc: common.Util.TR('CPU Usage window frame displays CPU usage of monitoring target servers.') },
        { ID: 'M_rtmTPTransactionMonitor'   ,  desc: common.Util.TR('Provides elapsed time distribution for transactions in real time. Easily identifies the bottleneck and checks method execution details, SQL execution details, and exception occurred details by providing transactions with long elapsed time.') },
        { ID: 'M_rtmTPActiveTxnList'        ,  desc: common.Util.TR('Monitors active transaction\'s detailed performance data of each server every three seconds. Identifies the root cause of delay transaction by providing each transactions\'s elapsed time, execution status, Method execution data, SQL execution data, etc.') },
        { ID: 'M_rtmTPActiveTxnRemoteTree'  ,  desc: common.Util.TR('Provides tree displaying transaction details and paths in real time for End-to-End perspective. Easily identifies problem tier and transaction occurred at that time.') },
        { ID: 'M_rtmTPTrendStat'            ,  desc: common.Util.TR('Displays the most recent trends of performance statistics in graphs. Identifies problem types by providing resource usage rate data and transaction throughput in real time.') },
        { ID: 'M_rtmTPAlertInfo'            ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmTPAlertLight'           ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmTPTmadmin'              ,  desc :common.Util.TR('Provide tmadmin information including Tmax process information, service information, and client connection information.') },
        { ID: 'M_rtmTPSlog'                 ,  desc :common.Util.TR('Provides information about the Tmax System Log information including Fatal, Error, Warning, and Info logs recorded in the Tmax Slog File.') },
        { ID: 'M_rtmTPTopTransaction'       ,  desc: common.Util.TR('Provides statistics of most time consuming transactions based on the average elapsed time of transactions within last hour.') },
        { ID: 'M_rtmTPTopSQL'               ,  desc: common.Util.TR('Provides statistics of most time consuming SQL based on the average elapsed time of SQL within last hour.') },
        { ID: 'M_rtmTPDiskUsage'            ,  desc: common.Util.TR('Displays disk I/O status of monitored servers.') },

        // Tuxedo
        //Performance Analysis
        { ID: 'M_TuxTrend'                   ,  desc :common.Util.TR('Performance information of each WAS and related DB will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active transactions for the time.') },
        { ID: 'M_TuxTransactionTrend'        ,  desc :common.Util.TR('Both static transaction response time chart for the specified period and another transaction response time chart dynamically updated in real time will be displayed at the same time. And transaction detail will be shown by double-clicking a transaction from the grid.') },
        { ID: 'M_TuxDBTrend'                 ,  desc :common.Util.TR('Database performance information will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active sessions for the time.') },

        //Performance Statistics
        { ID: 'M_TuxTopTransaction'          ,  desc :common.Util.TR('Most executed or most time consuming transactions will be retrieved with detailed trend chart and also SQL performance data.') },
        { ID: 'M_TuxTopSQL'                  ,  desc :common.Util.TR('TOP 20 SQL statements executed most frequently or having longest elapsed time will be retrieved for the specified time period.') },
        { ID: 'M_TuxAlertHistory'            ,  desc :common.Util.TR('By hourly or minutely, summarized data of all occurred alerts shown with a chart.') },
        { ID: 'M_TuxEtoEResponseTrend'       ,  desc :common.Util.TR('Each tier\'s average and maximum response time covering from end to end with trend chart and detail data.') },

        //Docking Frame
        { ID: 'M_rtmTuxActivityMonitor'      ,  desc: common.Util.TR('Allows intuitive monitoring of real time service executions by dynamically displaying request rate per second, throughput per second, and number of transactions.') },
        { ID: 'M_rtmTuxActiveTxnCount'       ,  desc: common.Util.TR('Verifies the number of active transaction for multiple servers in real time. Monitors entire service execution status by providing number of active transactions classified according to transaction\'s elapsed time in blue, yellow, and red.') },
        { ID: 'M_rtmTuxUsageCpu'             ,  desc: common.Util.TR('CPU Usage window frame displays CPU usage of monitoring target servers.') },
        { ID: 'M_rtmTuxTransactionMonitor'   ,  desc: common.Util.TR('Provides elapsed time distribution for transactions in real time. Easily identifies the bottleneck and checks method execution details, SQL execution details, and exception occurred details by providing transactions with long elapsed time.') },
        { ID: 'M_rtmTuxActiveTxnList'        ,  desc: common.Util.TR('Monitors active transaction\'s detailed performance data of each server every three seconds. Identifies the root cause of delay transaction by providing each transactions\'s elapsed time, execution status, Method execution data, SQL execution data, etc.') },
        { ID: 'M_rtmTuxActiveTxnRemoteTree'  ,  desc: common.Util.TR('Provides tree displaying transaction details and paths in real time for End-to-End perspective. Easily identifies problem tier and transaction occurred at that time.') },
        { ID: 'M_rtmTuxTrendStat'            ,  desc: common.Util.TR('Displays the most recent trends of performance statistics in graphs. Identifies problem types by providing resource usage rate data and transaction throughput in real time.') },
        { ID: 'M_rtmTuxAlertInfo'            ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmTuxAlertLight'           ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmTuxTmadmin'              ,  desc :common.Util.TR('Provide tmadmin information including Tmax process information, service information, and client connection information.') },
        { ID: 'M_rtmTuxULOG'                 ,  desc :common.Util.TR('Provides information about the Tmax System Log information including Fatal, Error, Warning, and Info logs recorded in the Tmax Slog File.') },
        { ID: 'M_rtmTuxTopTransaction'       ,  desc: common.Util.TR('Provides statistics of most time consuming transactions based on the average elapsed time of transactions within last hour.') },
        { ID: 'M_rtmTuxTopSQL'               ,  desc: common.Util.TR('Provides statistics of most time consuming SQL based on the average elapsed time of SQL within last hour.') },
        { ID: 'M_rtmTuxDiskUsage'            ,  desc: common.Util.TR('Displays disk I/O status of monitored servers.') },


        //dashboard
        { ID: 'M_dashTPtmadminMonitor'      ,  desc :common.Util.TR('Provide tmadmin information including Tmax process information, service information, and client connection information.') },     //,  desc :common.Util.TR('M_dashTPtmadminMonitor') },
        // WEB
        //Performance Analysis
        { ID: 'M_WebTrend'                  ,  desc :common.Util.TR('Performance information of each WEB SERVER and related DB will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active transactions for the time.') },
        { ID: 'M_WebTransactionTrend'       ,  desc :common.Util.TR('Both static transaction response time chart for the specified period and another transaction response time chart dynamically updated in real time will be displayed at the same time. And transaction detail will be shown by double-clicking a transaction from the grid.') },
        { ID: 'M_WebComparisonTrend'        ,  desc :common.Util.TR('Performance Comparison Analysis Performance of different WEB SERVERs on different dates can be compared and analyzed.') },
        { ID: 'M_WebElapseDistribution'     ,  desc :common.Util.TR('Provides a scatter plot of Transaction Elapsed Time vs. Transaction End Time. The dots will appear red, if any exceptions occurred. Drag an area to get detailed information about the selected transactions.') },

        //Performance Statistics
        { ID: 'M_WebTopTransaction'         ,  desc :common.Util.TR('Most executed or most time consuming transactions will be retrieved with detailed trend chart and also SQL performance data.') },
        { ID: 'M_WebTransactionHistory'     ,  desc :common.Util.TR('Summed up transaction performance data and trend charts for every 10 minutes.') },
        { ID: 'M_WebStatsByResponseCode'    ,  desc :common.Util.TR('Provides statistical information about the occurrence of http response code by the invoked URL.') },
        { ID: 'M_WebWASWorkloadHistory'     ,  desc :common.Util.TR('Load balancing information between clustered web application servers.') },
        { ID: 'M_WebAlertHistory'           ,  desc :common.Util.TR('By hourly or minutely, summarized data of all occurred alerts shown with a chart.') },
        { ID: 'M_WebClientHistory'          ,  desc :common.Util.TR('The execution count and elapse time of transactions grouped by users\'IP address.') },
        //{ ID: 'M_WebEtoEResponseTrend'      ,  desc :common.Util.TR('Each tier\'s average and maximum response time covering from end to end with trend chart and detail data.') },

        //Docking Frame
        { ID: 'M_rtmWebActivityMonitor'     ,  desc: common.Util.TR('Allows intuitive monitoring of real time service executions by dynamically displaying request rate per second, throughput per second, and number of transactions.') },
        { ID: 'M_rtmWebActiveTxnCount'      ,  desc: common.Util.TR('Verifies the number of active transaction for multiple servers in real time. Monitors entire service execution status by providing number of active transactions classified according to transaction\'s elapsed time in blue, yellow, and red.') },
        { ID: 'M_rtmWebTransactionMonitor'  ,  desc :common.Util.TR('Provides elapsed time distribution for transactions in real time. Easily identifies the bottleneck and checks method execution details, SQL execution details, and exception occurred details by providing transactions with long elapsed time.') },
        { ID: 'M_rtmWebActiveTxnList'       ,  desc :common.Util.TR('Monitors active transaction\'s detailed performance data of each server every three seconds. Identifies the root cause of delay transaction by providing each transactions\'s elapsed time, execution status, Method execution data, SQL execution data, etc.') },
        { ID: 'M_rtmWebTrendStat'           ,  desc :common.Util.TR('Displays the most recent trends of performance statistics in graphs. Identifies problem types by providing resource usage rate data and transaction throughput in real time.') },
        { ID: 'M_rtmWebAlertInfo'           ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmWebAlertLight'          ,  desc: common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmWebResponseStatus'      ,  desc :common.Util.TR('Provides realtime occurrence graph about http/https response codes which is 4xx and 5xx.') },
        { ID: 'M_rtmWebVisitorCounter'      ,  desc: common.Util.TR('Displays number of visitors who navigated web applications today and yesterday.') },
        { ID: 'M_rtmWebadmin'               ,  desc :common.Util.TR('Provides WebtoB status information provided on the wsadmin screen, including process information, server status information, and client connection information.') },
        { ID: 'M_rtmWebBlockRun'            ,  desc :common.Util.TR('Provides information on the occurrence of a WebtoB blocked run(BRun) which causes transacion delay.') },

        // C Daemon
        //Performance Analysis
        { ID: 'M_CDTrend'                   ,  desc :common.Util.TR('Performance information of each WAS and related DB will be displayed by multiple trend charts. When you choose certain time by double clicking on a trend chart then you will see all of the active transactions for the time.') },
        { ID: 'M_CDTransactionTrend'        ,  desc :common.Util.TR('Both static transaction response time chart for the specified period and another transaction response time chart dynamically updated in real time will be displayed at the same time. And transaction detail will be shown by double-clicking a transaction from the grid.') },
        { ID: 'M_CDComparisonTrend'         ,  desc :common.Util.TR('Performance Comparison Analysis Performance of different WASs on different dates can be compared and analyzed.') },
        { ID: 'M_CDElapseDistribution'      ,  desc :common.Util.TR('Provides a scatter plot of Transaction Elapsed Time vs. Transaction End Time. The dots will appear red, if any exceptions occurred. Drag an area to get detailed information about the selected transactions.') },

        //Performance Statistics
        { ID: 'M_CDTopTransaction'          ,  desc :common.Util.TR('Most executed or most time consuming transactions will be retrieved with detailed trend chart and also SQL performance data.') },
        { ID: 'M_CDTransactionHistory'      ,  desc :common.Util.TR('Summed up transaction performance data and trend charts for every 10 minutes.') },
        { ID: 'M_CDWASWorkloadHistory'      ,  desc :common.Util.TR('Load balancing information between clustered web application servers.') },
        { ID: 'M_CDAlertHistory'            ,  desc :common.Util.TR('By hourly or minutely, summarized data of all occurred alerts shown with a chart.') },
        { ID: 'M_CDDailySummary'            ,  desc :common.Util.TR('From the daily statistics, you can Drill Down to the trend of specific transactions. Provides statistical information on the number of calls per day, number of visitors, number of errors, provides detailed hourly statistical information on a specific date, and provides detailed information on specific transaction and SQL querie. In addition, if you select a specific transaction and SQL, you can get drill down analysis of performance problem by providing daily and hourly trend information on that transaction and SQL.') },

        //Docking Frame
        { ID: 'M_rtmCDActivityMonitor'      ,  desc :common.Util.TR('Allows intuitive monitoring of real time service executions by dynamically displaying request rate per second, throughput per second, and number of transactions.') },
        { ID: 'M_rtmCDTransactionMonitor'   ,  desc :common.Util.TR('Provides elapsed time distribution for transactions in real time. Easily identifies the bottleneck and checks method execution details, SQL execution details, and exception occurred details by providing transactions with long elapsed time.') },
        { ID: 'M_rtmCDTrendStat'            ,  desc :common.Util.TR('Displays the most recent trends of performance statistics in graphs. Identifies problem types by providing resource usage rate data and transaction throughput in real time.') },
        { ID: 'M_rtmCDAlertInfo'            ,  desc :common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmCDAlertLight'           ,  desc :common.Util.TR('Displays warning notices in real-time. Click on the warning message for details.') },
        { ID: 'M_rtmCDUsageOSCpu'           ,  desc: common.Util.TR('CPU Usage window frame displays CPU usage of monitoring target servers.') },
        { ID: 'M_rtmCDTopTransaction'       ,  desc: common.Util.TR('Provides statistics of most time consuming transactions based on the average elapsed time of transactions within last hour.') },
        { ID: 'M_rtmCDTopSQL'               ,  desc: common.Util.TR('Provides statistics of most time consuming SQL based on the average elapsed time of SQL within last hour.') },
        { ID: 'M_rtmCDDiskUsage'            ,  desc: common.Util.TR('Displays disk I/O status of monitored servers.') },

        //EtoE
        { ID: 'M_E2EAlertHistory'           ,  desc :common.Util.TR('By hourly or minutely, summarized data of all occurred alerts shown with a chart.') },
        { ID: 'M_E2EElapseDistribution'     ,  desc :common.Util.TR('Provides a scatter plot of Transaction Elapsed Time vs. Transaction End Time. The dots will appear red, if any exceptions occurred. Drag an area to get detailed information about the selected transactions.') },
        { ID: 'M_E2EResponseTime'           ,  desc :'' },

        // Configuration
        { ID: 'M_Configuration'             ,  desc :common.Util.TR('Settings for followings - Environment Settings, User Settings, Alert Settings, Business Settings, Repository Settings, JSPD Property Settings') }


    ],

    RTMMenu: [
        { text: 'WAS Monitor',  cls: 'rtm.view.rtmView',     isDockContainer : true,     specifiedView: []}
    ],

    defaultView: {
        className : 'view.PerformanceTrend',
        title     : common.Util.TR('Performance Trend')
    },

    nonDbHiddenMenu: [
        'M_DBTrend'
        ,'M_TPDBTrend'
        ,'M_rtmDatabase'
        ,'M_rtmTablespaceUsage'
        ,'M_rtmActiveTxnLockTree'
    ],

    getClassConfig: function(srcName) {
        var config = {
            OpenViewTestTarget: {
                testConfInMenuJS: 'val1'
            },
            ResponseInspector: {
                parentScatter: Comm.invisibleScatter
            },

            ScriptManager              : { isWindow : true,  isDock : false,  width : 900,   height : 500,   minWidth : 530,   minHeight : 436  },

            // WAS Component
            rtmActiveTxnList           : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmActiveTxnLockTree       : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmActiveTxnRemoteTree     : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmTopTransaction          : { isWindow : true,  isDock : true,   width : 600,   height : 360,   minWidth : 200,   minHeight : 150  },
            rtmTransactionMonitor      : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 130  },
            rtmAlert                   : { isWindow : true,  isDock : true,   width : 600,   height : 360,   minWidth : 300,   minHeight : 300  },
            rtmAlertInfo               : { isWindow : true,  isDock : true,   width : 400,   height : 50,    minWidth : 100,   minHeight : 50,  maxHeight: 50,   hasChild: false },
            rtmAlertLight              : { isWindow : true,  isDock : true,   width : 400,   height : 300,   minWidth : 300,   minHeight : 145  },
            rtmActiveTxnCount          : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmGCStat                  : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 350,   minHeight : 180  },
            rtmDatabase                : { isWindow : true,  isDock : true,   width : 600,   height : 250,   minWidth : 150,   minHeight : 135  },
            rtmConnectionPool          : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 150,   minHeight : 130  },
            rtmActivityMonitor         : { isWindow : true,  isDock : true,   width : 800,   height : 145,   minWidth : 730,   minHeight : 140, singleton: true},
            rtmServiceStat             : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 350,   minHeight : 200  },
            rtmPerformanceStat         : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 90   },
            rtmConcurrentUserStat      : { isWindow : true,  isDock : true,   width : 400,   height : 200,   minWidth : 200,   minHeight : 90   },
            rtmLockWaitSession         : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 150,   minHeight : 150  },
            rtmDailyProcessing         : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 150,   minHeight : 150  },
            rtmProcessingTimeline      : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 150,   minHeight : 150  },
            rtmSystemStatus            : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 150,   minHeight : 150  },
            rtmTablespaceUsage         : { isWindow : true,  isDock : true,   width : 500,   height : 300,   minWidth : 250,   minHeight : 150  },
            rtmTopSQL                  : { isWindow : true,  isDock : true,   width : 500,   height : 300,   minWidth : 180,   minHeight : 130  },
            rtmAgentList               : { isWindow : true,  isDock : true,   width : 400,   height : 32,    minWidth : 150,   minHeight : 32,  singleton: true,  hasChild: false  },
            rtmUsageCpu                : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmUsageOSCpu              : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmUsageJVMCpu             : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmActivityGroup           : { isWindow : true,  isDock : true,   width : 750,   height : 220,   minWidth : 720,   minHeight : 220  },
            rtmActiveTxnGroupCount     : { isWindow : true,  isDock : true,   width : 700,   height : 250,   minWidth : 300,   minHeight : 120  },
            rtmServiceStatTrend        : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmVisitorCounter          : { isWindow : true,  isDock : true,   width : 700,   height : 350,   minWidth : 300,   minHeight : 80   },
            rtmWebVisitorCounter       : { isWindow : true,  isDock : true,   width : 700,   height : 350,   minWidth : 300,   minHeight : 80   },
            rtmTxnExecutionCount       : { isWindow : true,  isDock : true,   width : 700,   height : 350,   minWidth : 300,   minHeight : 80   },
            rtmPerformanceTotalStat    : { isWindow : true,  isDock : true,   width : 700,   height : 200,   minWidth : 200,   minHeight : 90   },
            rtmDiskUsage               : { isWindow : true,  isDock : true,   width : 550,   height : 300,   minWidth : 250,   minHeight : 150  },
            rtmProcessStatus           : { isWindow : true,  isDock : true,   width : 650,   height : 300,   minWidth : 250,   minHeight : 150  },
            rtmAPMonitor               : { isWindow : true,  isDock : true,   width : 650,   height : 300,   minWidth : 280,   minHeight : 150  },
            rtmAPSummary               : { isWindow : true,  isDock : true,   width : 650,   height : 300,   minWidth : 280,   minHeight : 150  },
            rtmBizGroupPerformanceMetrics : { isWindow : true,  isDock : true,   width : 400,   height : 250,   minWidth : 250,   minHeight : 130  },
            rtmMajorTxnList            : { isWindow : true,  isDock : true,   width : 650,   height : 300,   minWidth : 250,   minHeight : 130  },
            rtmMemoryLeakList          : { isWindow : true,  isDock : true,   width : 900,   height : 360,   minWidth : 320,   minHeight : 150  },
            rtmIntegrationTracking     : { isWindow : true,  isDock : true,   width : 1200,  height : 280,   minWidth : 200,   minHeight : 130  },
            rtmTrackByTask             : { isWindow : true,  isDock : true,   width : 1200,  height : 740,   minWidth : 500,   minHeight : 350  },
            rtmTrackByTaskChart        : { isWindow : true,  isDock : true,   width : 1200,  height : 740,   minWidth : 500,   minHeight : 350  },
            rtmTPSMonitor              : { isWindow : true,  isDock : true,   width : 1200,  height : 200,   minWidth : 200,   minHeight : 90   },
            rtmElapseMonitor           : { isWindow : true,  isDock : true,   width : 1200,  height : 200,   minWidth : 200,   minHeight : 90   },
            rtmTrackTaskSummary        : { isWindow : true,  isDock : true,   width : 1200,  height : 50,    minWidth : 1480,  minHeight : 50   },
            rtmBizTaskCounter          : { isWindow : true,  isDock : true,   width : 1000,  height : 400,   minWidth : 400,   minHeight : 180   },
            rtmTrackSingleTask         : { isWindow : true,  isDock : true,   width : 400,   height : 220,   minWidth : 400,   minHeight : 220, maxHeight : 220 },
            rtmLoadPredict             : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDBLoadPredict           : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmTxnLoadPredict          : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmBizLoadPredict          : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmAnomalyDetection        : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDBAnomalyDetection      : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },

            rtmDashLoadPredict         : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashDBLoadPredict       : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashTxnLoadPredict      : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashTxnLoadPredict1     : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashTxnLoadPredict2     : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashTxnLoadPredict3     : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashLoadPredictMCA      : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashLoadPredictCBS      : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashLoadPredictFEP      : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashboardAlarm          : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashboardInstanceInfo   : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashAbnormalStatSummary : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 250,   minHeight : 90   },
            rtmDashAbnormalStatInfo    : { isWindow : true,  isDock : true,   width : 600,   height : 600,   minWidth : 250,   minHeight : 90   },
            rtmDashAbnormalLogInfo     : { isWindow : true,  isDock : true,   width : 800,   height : 150,   minWidth : 600,   minHeight : 90   },

            // Web Component
            rtmWebActivityMonitor      : { isWindow : true,  isDock : true,   width : 800,   height : 145,   minWidth : 730,   minHeight : 140, singleton: true},
            rtmWebTransactionMonitor   : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 130  },
            rtmWebTrendStat            : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 90   },
            rtmWebAlertInfo            : { isWindow : true,  isDock : true,   width : 400,   height : 50,    minWidth : 100,   minHeight : 50,  maxHeight: 50,   hasChild: false },
            rtmWebAlertLight           : { isWindow : true,  isDock : true,   width : 400,   height : 300,   minWidth : 300,   minHeight : 145  },
            rtmWebActiveTxnList        : { isWindow : true,  isDock : true,   width : 800,   height : 360,   minWidth : 320,   minHeight : 150  },
            rtmWebActiveTxnCount       : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmWebResponseStatus       : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmWebadmin                : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmWebBlockRun             : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },

            // C Daemon Component
            rtmCDActivityMonitor      : { isWindow : true,  isDock : true,   width : 800,   height : 145,   minWidth : 730,   minHeight : 140, singleton: true},
            rtmCDTransactionMonitor   : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 130  },
            rtmCDTrendStat            : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 90   },
            rtmCDAlertInfo            : { isWindow : true,  isDock : true,   width : 400,   height : 50,    minWidth : 100,   minHeight : 50,  maxHeight: 50,   hasChild: false },
            rtmCDAlertLight           : { isWindow : true,  isDock : true,   width : 400,   height : 300,   minWidth : 300,   minHeight : 145  },
            rtmCDUsageOSCpu           : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmCDTopTransaction       : { isWindow : true,  isDock : true,   width : 600,   height : 360,   minWidth : 200,   minHeight : 150  },
            rtmCDTopSQL               : { isWindow : true,  isDock : true,   width : 500,   height : 300,   minWidth : 180,   minHeight : 130  },
            rtmCDDiskUsage            : { isWindow : true,  isDock : true,   width : 550,   height : 300,   minWidth : 250,   minHeight : 150  },

            // TP Component
            rtmTPActivityMonitor       : { isWindow : true,  isDock : true,   width : 800,   height : 145,   minWidth : 730,   minHeight : 140, singleton: true},
            rtmTPTransactionMonitor    : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 130  },
            rtmTPUsageCpu              : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmTPSlog                  : { isWindow : true,  isDock : true,   width : 650,   height : 300,   minWidth : 250,   minHeight : 130  },
            rtmTPTrendStat             : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 90   },
            rtmTPActiveTxnList         : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmTPAlertInfo             : { isWindow : true,  isDock : true,   width : 400,   height : 50,    minWidth : 100,   minHeight : 50,  maxHeight: 50,   hasChild: false },
            rtmTPAlertLight            : { isWindow : true,  isDock : true,   width : 400,   height : 300,   minWidth : 300,   minHeight : 145  },
            rtmTPTmadmin               : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmTPActiveTxnCount        : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmTPTopTransaction        : { isWindow : true,  isDock : true,   width : 600,   height : 360,   minWidth : 200,   minHeight : 150  },
            rtmTPTopSQL                : { isWindow : true,  isDock : true,   width : 500,   height : 300,   minWidth : 180,   minHeight : 130  },
            rtmTPDiskUsage             : { isWindow : true,  isDock : true,   width : 550,   height : 300,   minWidth : 250,   minHeight : 150  },

            // Tuxedo Component
            rtmTuxActivityMonitor       : { isWindow : true,  isDock : true,   width : 800,   height : 145,   minWidth : 730,   minHeight : 140, singleton: true},
            rtmTuxTransactionMonitor    : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 130  },
            rtmTuxUsageCpu              : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmTuxULOG                  : { isWindow : true,  isDock : true,   width : 1000,  height : 300,   minWidth : 250,   minHeight : 130  },
            rtmTuxTrendStat             : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 90   },
            rtmTuxActiveTxnList         : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmTuxAlertInfo             : { isWindow : true,  isDock : true,   width : 400,   height : 50,    minWidth : 100,   minHeight : 50,  maxHeight: 50,   hasChild: false },
            rtmTuxAlertLight            : { isWindow : true,  isDock : true,   width : 400,   height : 300,   minWidth : 300,   minHeight : 145  },
            rtmTuxTmadmin               : { isWindow : true,  isDock : true,   width : 1000,  height : 360,   minWidth : 320,   minHeight : 150  },
            rtmTuxActiveTxnCount        : { isWindow : true,  isDock : true,   width : 800,   height : 260,   minWidth : 300,   minHeight : 120  },
            rtmTuxTopTransaction        : { isWindow : true,  isDock : true,   width : 600,   height : 360,   minWidth : 200,   minHeight : 150  },
            rtmTuxTopSQL                : { isWindow : true,  isDock : true,   width : 500,   height : 300,   minWidth : 180,   minHeight : 130  },
            rtmTuxDiskUsage             : { isWindow : true,  isDock : true,   width : 550,   height : 300,   minWidth : 250,   minHeight : 150  },

            // EtoE Component
            rtmEtoEAlertInfo           : { isWindow : true,  isDock : true,   width : 400,   height : 50,    minWidth : 100,   minHeight : 50,  maxHeight: 50,   hasChild: false },
            rtmEtoETransactionMonitor  : { isWindow : true,  isDock : true,   width : 700,   height : 400,   minWidth : 200,   minHeight : 130  },

            // Business Component
            rtmBizServiceStatTrend     : { isWindow : true,  isDock : true,   width : 700,   height : 350,   minWidth : 550,   minHeight : 110   },
            rtmBizActiveTxnCount       : { isWindow : true,  isDock : true,   width : 600,   height : 300,   minWidth : 400,   minHeight : 110   }
        };
        return config[srcName] || {};
    }
}, function() {
    var keys = Object.keys(window.parent.common.Menu),
        ix, ixLen;

    for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
        common.Menu[keys[ix]] = window.parent.common.Menu[keys[ix]];
    }
});
