// OpenAPI仕様オブジェクト
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Reservation System API',
    version: '1.0.0',
    description: '予約システムのAPI仕様書です。ユーザー、スコア、予約の管理機能を提供します。',
  },
  servers: [
    {
      url: '/api',
      description: 'API サーバー',
    },
  ],
  paths: {
    '/users': {
      get: {
        summary: '全ユーザー取得',
        description: 'すべてのユーザーを取得します（スコアと予約情報も含む）',
        tags: ['Users'],
        responses: {
          '200': {
            description: 'ユーザー一覧',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      scores: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            score: { type: 'number' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                          }
                        }
                      },
                      reservations: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            receiptNumber: { type: 'string' },
                            numberOfPeople: { type: 'number' },
                            startTime: { type: 'string', format: 'date-time' },
                            endTime: { type: 'string', format: 'date-time' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
      post: {
        summary: 'ユーザー作成',
        description: '新しいユーザーを作成します',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, description: 'ユーザー名' }
                },
                required: ['name']
              },
            },
          },
        },
        responses: {
          '201': {
            description: '作成されたユーザー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
            },
          },
          '400': {
            description: 'バリデーションエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        summary: '特定ユーザー取得',
        description: 'IDを指定してユーザーを取得します',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ユーザーID',
          },
        ],
        responses: {
          '200': {
            description: 'ユーザー情報',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
            },
          },
          '404': {
            description: 'ユーザーが見つかりません',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
      put: {
        summary: 'ユーザー更新',
        description: 'ユーザー情報を更新します',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ユーザーID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, description: 'ユーザー名' }
                }
              },
            },
          },
        },
        responses: {
          '200': {
            description: '更新されたユーザー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
            },
          },
          '400': {
            description: 'バリデーションエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
          '404': {
            description: 'ユーザーが見つかりません',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
      delete: {
        summary: 'ユーザー削除',
        description: 'ユーザーを削除します',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ユーザーID',
          },
        ],
        responses: {
          '200': {
            description: '削除成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  },
                  required: ['message']
                }
              },
            },
          },
          '404': {
            description: 'ユーザーが見つかりません',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
    },
    '/scores': {
      get: {
        summary: '全スコア取得',
        description: 'すべてのスコアを取得します',
        tags: ['Scores'],
        responses: {
          '200': {
            description: 'スコア一覧',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      userId: { type: 'number' },
                      score: { type: 'number' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          name: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
      post: {
        summary: 'スコア作成',
        description: '新しいスコアを作成します',
        tags: ['Scores'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'number', description: 'ユーザーID' },
                  score: { type: 'number', description: 'スコア値' }
                },
                required: ['userId', 'score']
              },
            },
          },
        },
        responses: {
          '201': {
            description: '作成されたスコア',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    userId: { type: 'number' },
                    score: { type: 'number' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
            },
          },
          '400': {
            description: 'バリデーションエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
    },
    '/reservations': {
      get: {
        summary: '全予約取得',
        description: 'すべての予約を取得します',
        tags: ['Reservations'],
        responses: {
          '200': {
            description: '予約一覧',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      userId: { type: 'number' },
                      receiptNumber: { type: 'string' },
                      numberOfPeople: { type: 'number' },
                      startTime: { type: 'string', format: 'date-time' },
                      endTime: { type: 'string', format: 'date-time' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          name: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
      post: {
        summary: '予約作成',
        description: '新しい予約を作成します',
        tags: ['Reservations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'number', description: 'ユーザーID' },
                  receiptNumber: { type: 'string', minLength: 1, description: 'レシート番号' },
                  numberOfPeople: { type: 'number', minimum: 1, description: '人数' },
                  startTime: { type: 'string', format: 'date-time', description: '開始時刻' },
                  endTime: { type: 'string', format: 'date-time', description: '終了時刻' }
                },
                required: ['userId', 'receiptNumber', 'numberOfPeople', 'startTime', 'endTime']
              },
            },
          },
        },
        responses: {
          '201': {
            description: '作成された予約',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    userId: { type: 'number' },
                    receiptNumber: { type: 'string' },
                    numberOfPeople: { type: 'number' },
                    startTime: { type: 'string', format: 'date-time' },
                    endTime: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
            },
          },
          '400': {
            description: 'バリデーションエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
          '500': {
            description: 'サーバーエラー',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  },
                  required: ['error']
                }
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Users',
      description: 'ユーザー管理API'
    },
    {
      name: 'Scores',
      description: 'スコア管理API'
    },
    {
      name: 'Reservations',
      description: '予約管理API'
    }
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'createdAt', 'updatedAt']
      },
      Score: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          userId: { type: 'number' },
          score: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'userId', 'score', 'createdAt', 'updatedAt']
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          userId: { type: 'number' },
          receiptNumber: { type: 'string' },
          numberOfPeople: { type: 'number' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'userId', 'receiptNumber', 'numberOfPeople', 'startTime', 'endTime', 'createdAt', 'updatedAt']
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'string' }
        },
        required: ['error']
      }
    },
  },
};

// OpenAPIスキーマを提供するエンドポイント用の関数
export function getOpenApiSpec() {
  return openApiSpec;
}
