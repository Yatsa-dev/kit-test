export type GetTasksFilters = {
  status?: string;
  createdAt?: { $gte?: Date; $lt?: Date };
  $or?: any[];
};
