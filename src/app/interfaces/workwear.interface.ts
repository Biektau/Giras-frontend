import { WorkwearCategory } from "../enums/workwear-category.enum";
import { WorkwearSeason } from "../enums/workwear-season.enum";
import { WorkwearItemSet } from "../enums/workwear-set.enum";
import { WorkwearSize } from "../enums/workwear-size.enum";

export interface Workwear {
    id: string;
    name: string;
    description?: string;
    category: WorkwearCategory;
    size: WorkwearSize[];
    color: string;
    season: WorkwearSeason;
    set: WorkwearItemSet;
    price: number;
    sku: string;
    isCertified: boolean
    images?: string[];
    material: string;
    order?: number;
    createdAt: string;
    updatedAt: string;
}