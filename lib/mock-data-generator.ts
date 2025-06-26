/**
 * 优化的模拟数据生成器
 * 提供高性能的数据生成和缓存机制
 */

import { dataCache, withCache } from './data-cache';

export interface SampleData {
  id: string;
  record_date?: string;
  shipment_date?: string;
  shift?: string;
  mineral_type?: string;
  element?: string;
  grade_value?: number;
  moisture_value?: number;
  filter_press_number?: string;
  supplier?: string;
  purchasing_unit_name?: string;
  assayed_metal_element?: string;
  shipment_sample_grade_percentage?: number;
  shipment_sample_moisture_percentage?: number;
  [key: string]: any;
}

export type DataSource = 'shift_samples' | 'filter_samples' | 'incoming_samples' | 'outgoing_sample';

interface DateRange {
  from: Date;
  to: Date;
}

class MockDataGenerator {
  private static instance: MockDataGenerator;
  
  // 预定义数据模板
  private readonly dataTemplates = {
    shift_samples: {
      shifts: ['白班', '中班', '夜班'],
      mineralTypes: ['铜矿', '铅锌矿', '金矿', '银矿'],
      elements: ['Cu', 'Pb', 'Zn', 'Au', 'Ag'],
      gradeRange: [15, 30],
      moistureRange: [6, 12]
    },
    filter_samples: {
      elements: ['Cu', 'Pb', 'Zn', 'Au'],
      gradeRange: [18, 35],
      moistureRange: [5, 10],
      filterPressNumbers: ['YL-001', 'YL-002', 'YL-003', 'YL-004', 'YL-005']
    },
    incoming_samples: {
      elements: ['Cu', 'Pb', 'Zn', 'Au', 'Ag'],
      gradeRange: [12, 28],
      moistureRange: [8, 15],
      suppliers: [
        '山西铜业有限公司',
        '河北锌矿集团',
        '内蒙古金矿开发',
        '云南有色金属',
        '江西铜业股份'
      ]
    },
    outgoing_sample: {
      elements: ['Cu', 'Pb', 'Zn', 'Au'],
      gradeRange: [20, 32],
      moistureRange: [4, 8],
      purchasingUnits: [
        '江苏冶炼厂',
        '浙江金属公司',
        '上海有色集团',
        '广东精炼厂',
        '福建冶金公司'
      ]
    }
  };

  public static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  /**
   * 生成指定数量的模拟数据
   */
  private generateDataForSource(
    dataSource: DataSource,
    count: number,
    dateRange: DateRange
  ): SampleData[] {
    const data: SampleData[] = [];
    const template = this.dataTemplates[dataSource];
    
    for (let i = 0; i < count; i++) {
      const date = this.randomDateInRange(dateRange);
      const baseData = {
        id: `${dataSource}_${Date.now()}_${i}`,
        record_date: dataSource !== 'outgoing_sample' ? date : undefined,
        shipment_date: dataSource === 'outgoing_sample' ? date : undefined,
      };

      let specificData: Partial<SampleData> = {};

      switch (dataSource) {
        case 'shift_samples':
          specificData = {
            shift: this.randomChoice(template.shifts),
            mineral_type: this.randomChoice(template.mineralTypes),
            element: this.randomChoice(template.elements),
            grade_value: this.randomFloat(template.gradeRange[0], template.gradeRange[1]),
            moisture_value: this.randomFloat(template.moistureRange[0], template.moistureRange[1])
          };
          break;

        case 'filter_samples':
          specificData = {
            element: this.randomChoice(template.elements),
            grade_value: this.randomFloat(template.gradeRange[0], template.gradeRange[1]),
            moisture_value: this.randomFloat(template.moistureRange[0], template.moistureRange[1]),
            filter_press_number: this.randomChoice(template.filterPressNumbers)
          };
          break;

        case 'incoming_samples':
          specificData = {
            element: this.randomChoice(template.elements),
            grade_value: this.randomFloat(template.gradeRange[0], template.gradeRange[1]),
            moisture_value: this.randomFloat(template.moistureRange[0], template.moistureRange[1]),
            supplier: this.randomChoice(template.suppliers)
          };
          break;

        case 'outgoing_sample':
          specificData = {
            purchasing_unit_name: this.randomChoice(template.purchasingUnits),
            assayed_metal_element: this.randomChoice(template.elements),
            shipment_sample_grade_percentage: this.randomFloat(template.gradeRange[0], template.gradeRange[1]),
            shipment_sample_moisture_percentage: this.randomFloat(template.moistureRange[0], template.moistureRange[1])
          };
          break;
      }

      data.push({ ...baseData, ...specificData });
    }

    return data;
  }

  /**
   * 获取模拟数据（带缓存）
   */
  public async getData(
    dataSource: DataSource,
    dateRange: DateRange,
    count: number = 20
  ): Promise<SampleData[]> {
    const cacheKey = `mock_data_${dataSource}_${dateRange.from.toISOString()}_${dateRange.to.toISOString()}_${count}`;
    
    // 尝试从缓存获取
    const cached = dataCache.get<SampleData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

    // 生成新数据
    const data = this.generateDataForSource(dataSource, count, dateRange);
    
    // 缓存数据（5分钟TTL）
    dataCache.set(cacheKey, data, { ttl: 5 * 60 * 1000 });
    
    return data;
  }

  /**
   * 预加载数据
   */
  public async preloadData(dataSources: DataSource[], dateRange: DateRange): Promise<void> {
    const promises = dataSources.map(source => 
      this.getData(source, dateRange, 20)
    );
    
    await Promise.all(promises);
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    dataCache.clear();
  }

  // 工具方法
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomFloat(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
  }

  private randomDateInRange(dateRange: DateRange): string {
    const start = dateRange.from.getTime();
    const end = dateRange.to.getTime();
    const randomTime = start + Math.random() * (end - start);
    return new Date(randomTime).toISOString().split('T')[0];
  }
}

// 导出单例实例
export const mockDataGenerator = MockDataGenerator.getInstance();

// 导出带缓存的数据获取函数
export const getCachedMockData = withCache(
  async (dataSource: DataSource, dateRange: DateRange, count: number = 20) => {
    return mockDataGenerator.getData(dataSource, dateRange, count);
  },
  (dataSource, dateRange, count) => 
    `mock_${dataSource}_${dateRange.from.toISOString()}_${dateRange.to.toISOString()}_${count}`,
  { ttl: 5 * 60 * 1000, useLocalStorage: true }
);
