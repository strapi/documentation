import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './ApiExplorer.module.scss';

/**
 * Simulated API data — all responses match actual Strapi v5 behavior.
 * Status codes, response shapes, and field names are verified against docs.
 */
const API_DATA = {
  rest: {
    label: 'REST API',
    docBase: '/cms/api/rest',
    endpoints: [
      {
        method: 'GET',
        name: 'List entries',
        path: '/api/restaurants?populate=*',
        docHash: '#get-all',
        response: {
          status: 200,
          statusText: 'OK',
          time: 23,
          body: {
            data: [
              {
                id: 1,
                documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
                name: 'Biscotte Restaurant',
                description: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'A cozy place for brunch lovers.' }],
                  },
                ],
                createdAt: '2026-01-15T09:00:00.000Z',
                updatedAt: '2026-03-20T14:22:00.000Z',
                publishedAt: '2026-01-15T09:05:00.000Z',
                locale: 'en',
              },
            ],
            meta: {
              pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 },
            },
          },
        },
      },
      {
        method: 'GET',
        name: 'Get entry',
        path: '/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm',
        docHash: '#get',
        response: {
          status: 200,
          statusText: 'OK',
          time: 12,
          body: {
            data: {
              id: 1,
              documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
              name: 'Biscotte Restaurant',
              description: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'A cozy place for brunch lovers.' }],
                },
              ],
              createdAt: '2026-01-15T09:00:00.000Z',
              updatedAt: '2026-03-20T14:22:00.000Z',
              publishedAt: '2026-01-15T09:05:00.000Z',
              locale: 'en',
            },
            meta: {},
          },
        },
      },
      {
        method: 'POST',
        name: 'Create entry',
        path: '/api/restaurants',
        docHash: '#create',
        requestBody: {
          data: {
            name: 'Restaurant D',
            description: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'A very short description goes here.' }],
              },
            ],
          },
        },
        response: {
          status: 200,
          statusText: 'OK',
          time: 45,
          body: {
            data: {
              id: 2,
              documentId: 'f6g7h8i9j0k1l2m3n4o5pqr',
              name: 'Restaurant D',
              description: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'A very short description goes here.' }],
                },
              ],
              createdAt: '2026-04-05T14:30:00.000Z',
              updatedAt: '2026-04-05T14:30:00.000Z',
              publishedAt: null,
              locale: 'en',
            },
            meta: {},
          },
        },
      },
      {
        method: 'PUT',
        name: 'Update entry',
        path: '/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm',
        docHash: '#update',
        requestBody: {
          data: {
            name: 'BMK Paris Bamako',
            description: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'A very short description goes here.' }],
              },
            ],
          },
        },
        response: {
          status: 200,
          statusText: 'OK',
          time: 31,
          body: {
            data: {
              id: 1,
              documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
              name: 'BMK Paris Bamako',
              description: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'A very short description goes here.' }],
                },
              ],
              createdAt: '2026-01-15T09:00:00.000Z',
              updatedAt: '2026-04-05T15:00:00.000Z',
              publishedAt: '2026-01-15T09:05:00.000Z',
              locale: 'en',
            },
            meta: {},
          },
        },
      },
      {
        method: 'DELETE',
        name: 'Delete entry',
        path: '/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm',
        docHash: '#delete',
        response: {
          status: 204,
          statusText: 'No Content',
          time: 18,
          body: null,
        },
      },
    ],
  },
  graphql: {
    label: 'GraphQL',
    docBase: '/cms/api/graphql',
    endpoints: [
      {
        method: 'POST',
        name: 'Query collection',
        path: '/graphql',
        docHash: '#queries',
        requestBody: `{
  restaurants_connection {
    nodes {
      documentId
      name
    }
    pageInfo {
      page
      pageSize
      total
    }
  }
}`,
        response: {
          status: 200,
          statusText: 'OK',
          time: 35,
          body: {
            data: {
              restaurants_connection: {
                nodes: [
                  {
                    documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
                    name: 'Biscotte Restaurant',
                  },
                ],
                pageInfo: { page: 1, pageSize: 10, total: 1 },
              },
            },
          },
        },
      },
      {
        method: 'POST',
        name: 'Query single',
        path: '/graphql',
        docHash: '#queries',
        requestBody: `{
  restaurant(documentId: "a1b2c3d4e5f6g7h8i9j0klm") {
    name
    description
  }
}`,
        response: {
          status: 200,
          statusText: 'OK',
          time: 18,
          body: {
            data: {
              restaurant: {
                name: 'Biscotte Restaurant',
                description: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'A cozy place for brunch lovers.' }],
                  },
                ],
              },
            },
          },
        },
      },
      {
        method: 'POST',
        name: 'Mutation create',
        path: '/graphql',
        docHash: '#mutations',
        requestBody: `mutation {
  createRestaurant(data: {
    name: "Pizzeria Arrivederci"
  }) {
    documentId
    name
  }
}`,
        response: {
          status: 200,
          statusText: 'OK',
          time: 42,
          body: {
            data: {
              createRestaurant: {
                documentId: 'f6g7h8i9j0k1l2m3n4o5pqr',
                name: 'Pizzeria Arrivederci',
              },
            },
          },
        },
      },
    ],
  },
  document: {
    label: 'Document Service',
    docBase: '/cms/api/document-service',
    endpoints: [
      {
        method: 'GET',
        name: 'findMany()',
        path: "await strapi.documents('api::restaurant.restaurant').findMany()",
        docHash: '#findmany',
        response: {
          status: 200,
          statusText: 'OK',
          time: 8,
          body: [
            {
              documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
              name: 'Biscotte Restaurant',
              description: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'A cozy place for brunch lovers.' }],
                },
              ],
              locale: 'en',
            },
          ],
        },
      },
      {
        method: 'GET',
        name: 'findOne()',
        path: "await strapi.documents('api::restaurant.restaurant').findOne({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm' })",
        docHash: '#findone',
        response: {
          status: 200,
          statusText: 'OK',
          time: 5,
          body: {
            documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
            name: 'Biscotte Restaurant',
            description: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'A cozy place for brunch lovers.' }],
              },
            ],
            locale: 'en',
          },
        },
      },
      {
        method: 'POST',
        name: 'create()',
        path: "await strapi.documents('api::restaurant.restaurant').create({ data: { name: 'Restaurant B' } })",
        docHash: '#create',
        response: {
          status: 200,
          statusText: 'OK',
          time: 15,
          body: {
            documentId: 'f6g7h8i9j0k1l2m3n4o5pqr',
            name: 'Restaurant B',
            createdAt: '2026-04-05T14:30:00.000Z',
            locale: 'en',
          },
        },
      },
    ],
  },
};

const METHOD_COLORS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
};

/**
 * Syntax-highlighted JSON renderer
 */
function JsonView({ data }) {
  const json = JSON.stringify(data, null, 2);
  const highlighted = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"([^"]+)"(?=\s*:)/g, '<span class="json-key">"$1"</span>')
    .replace(/:\s*"([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="json-bool">$1</span>');

  return (
    <pre
      className={styles.jsonPre}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

export default function ApiExplorer() {
  const [activeTab, setActiveTab] = useState('rest');
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const responseRef = useRef(null);

  const apiGroup = API_DATA[activeTab];
  const endpoint = apiGroup.endpoints[activeEndpoint];

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setActiveEndpoint(0);
    setShowResponse(true);
    setShowRequest(false);
  }, []);

  const handleEndpointChange = useCallback((index) => {
    setActiveEndpoint(index);
    setShowResponse(false);
    setShowRequest(false);
  }, []);

  const handleSend = useCallback(() => {
    setIsLoading(true);
    setShowResponse(false);
    setShowRequest(false);
    setTimeout(() => {
      setIsLoading(false);
      setShowResponse(true);
    }, 300 + Math.random() * 400);
  }, []);

  useEffect(() => {
    setShowResponse(true);
  }, []);

  const docLink = endpoint.docHash
    ? `${apiGroup.docBase}${endpoint.docHash}`
    : apiGroup.docBase;

  return (
    <div className={styles.explorer}>
      <div className={styles.explorerLabel}>API Explorer</div>
      <div className={styles.explorerCard}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {Object.entries(API_DATA).map(([key, group]) => (
            <button
              key={key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(key)}
            >
              <span className={styles.tabDot} />
              {group.label}
            </button>
          ))}
        </div>

        <div className={styles.explorerBody}>
          {/* Endpoint sidebar */}
          <div className={styles.endpointList}>
            {apiGroup.endpoints.map((ep, i) => (
              <button
                key={i}
                className={`${styles.endpointItem} ${i === activeEndpoint ? styles.endpointItemActive : ''}`}
                onClick={() => handleEndpointChange(i)}
              >
                <span className={`${styles.methodBadge} ${styles[`method${METHOD_COLORS[ep.method] || 'get'}`]}`}>
                  {ep.method}
                </span>
                <span className={styles.endpointName}>{ep.name}</span>
              </button>
            ))}
          </div>

          {/* Request + Response */}
          <div className={styles.requestPane}>
            {/* URL bar */}
            <div className={styles.urlBar}>
              <span className={`${styles.urlMethod} ${styles[`method${METHOD_COLORS[endpoint.method] || 'get'}`]}`}>
                {endpoint.method}
              </span>
              <span className={styles.urlPath}>{endpoint.path}</span>
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send \u25B6'}
              </button>
            </div>

            {/* Request body (for POST/PUT) */}
            {endpoint.requestBody && !showResponse && !isLoading && (
              <div className={styles.requestBodySection}>
                <div className={styles.requestBodyHeader}>Request Body</div>
                <div className={styles.responseBody}>
                  {typeof endpoint.requestBody === 'string'
                    ? <pre className={styles.jsonPre}>{endpoint.requestBody}</pre>
                    : <JsonView data={endpoint.requestBody} />
                  }
                </div>
              </div>
            )}

            {/* Response */}
            {showResponse && endpoint.response && (
              <div className={styles.response} ref={responseRef}>
                <div className={styles.responseHeader}>
                  <span className={`${styles.statusDot} ${endpoint.response.status < 300 ? styles.statusOk : styles.statusErr}`} />
                  <span className={styles.statusCode}>
                    {endpoint.response.status} {endpoint.response.statusText}
                  </span>
                  <span className={styles.responseTime}>{endpoint.response.time}ms</span>
                </div>
                <div className={styles.responseBody}>
                  {endpoint.response.body !== null
                    ? <JsonView data={endpoint.response.body} />
                    : <pre className={styles.jsonPre} style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>No response body</pre>
                  }
                </div>
              </div>
            )}

            {isLoading && (
              <div className={styles.response}>
                <div className={styles.loadingBar}>
                  <div className={styles.loadingBarInner} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Per-endpoint doc link */}
      <a href={docLink} className={styles.explorerDocLink}>
        Read the {apiGroup.label} docs →
      </a>
    </div>
  );
}
