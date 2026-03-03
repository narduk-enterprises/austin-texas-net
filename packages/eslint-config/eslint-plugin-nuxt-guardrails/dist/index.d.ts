interface PluginOptions {
    strictness?: 'low' | 'medium' | 'high';
    projectStyle?: 'app-dir' | 'mixed' | 'legacy' | 'auto';
    allowProcessClientServer?: boolean;
    requireStableAsyncDataKeys?: boolean;
}

/**
 * ESLint plugin for Nuxt 4 guardrails
 */
declare const _default: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'no-legacy-head': {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                fixable: string;
                schema: never[];
                messages: {
                    legacyHeadMethod: string;
                    legacyHeadOption: string;
                };
            };
            create(context: RuleContext<string, any[]>): RuleListener;
        };
        'no-legacy-fetch-hook': {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    legacyFetch: string;
                };
            };
            create(context: RuleContext<string, any[]>): RuleListener;
        };
        'prefer-import-meta-client': {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                fixable: string;
                schema: {
                    type: string;
                    properties: {
                        allowProcessClientServer: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    preferImportMetaClient: string;
                    preferImportMetaServer: string;
                };
            };
            create(context: RuleContext<string, PluginOptions[]>): RuleListener;
        };
        'no-ssr-dom-access': {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    unguardedDomAccess: string;
                };
            };
            create(context: RuleContext<string, any[]>): RuleListener;
        };
        'valid-useAsyncData': {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        requireStableAsyncDataKeys: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    missingCallback: string;
                    missingKey: string;
                    keyNotLiteral: string;
                    callbackReturnsNothing: string;
                };
            };
            create(context: RuleContext<string, PluginOptions[]>): RuleListener;
        };
        'valid-useFetch': {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    missingUrl: string;
                    invalidOptions: string;
                };
            };
            create(context: RuleContext<string, any[]>): RuleListener;
        };
        'app-structure-consistency': {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        projectStyle: {
                            type: string;
                            enum: string[];
                            default: string;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    conflictingStructure: string;
                };
            };
            create(context: RuleContext<string, PluginOptions[]>): RuleListener;
        };
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                'nuxt-guardrails/no-legacy-head': string;
                'nuxt-guardrails/no-legacy-fetch-hook': string;
                'nuxt-guardrails/prefer-import-meta-client': string;
                'nuxt-guardrails/no-ssr-dom-access': string;
                'nuxt-guardrails/valid-useAsyncData': string;
                'nuxt-guardrails/valid-useFetch': string;
                'nuxt-guardrails/app-structure-consistency': string;
            };
        };
    };
};

export { _default as default };
