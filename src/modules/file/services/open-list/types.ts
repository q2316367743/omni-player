export interface OpenListResult<T> {
  /**
   * @example 200
   */
  code: number;
  /**
   * @example Success
   */
  message: string;
  data: T;
}

export interface FsListResponse {
  content?: FsObject[];
  /**
   * Header content
   */
  header?: string;
  /**
   * Storage provider name
   */
  provider?: string;
  /**
   * README content (if exists)
   */
  readme?: string;
  /**
   * Total number of items
   */
  total?: number;
  /**
   * Whether current user has write permission
   */
  write?: boolean;
}

/**
 * FsObject
 */
export interface FsObject {
  /**
   * Creation time
   */
  created?: Date;
  /**
   * Parsed hash information
   */
  hash_info?: { [key: string]: string } | null;
  /**
   * Hash information (JSON string or "null")
   */
  hashinfo?: string;
  /**
   * Object ID (may be empty for local storage)
   */
  id?: string;
  /**
   * Whether this is a directory
   */
  is_dir?: boolean;
  /**
   * Last modified time
   */
  modified?: string;
  mount_details?: null | StorageDetails;
  /**
   * File or directory name
   */
  name?: string;
  /**
   * Full system path
   */
  path?: string;
  /**
   * Signature for download authentication
   */
  sign?: string;
  /**
   * File size in bytes (0 for directories)
   */
  size?: number;
  /**
   * Thumbnail URL (if available)
   */
  thumb?: string;
  /**
   * File type:
   * 0=Unknown, 1=Folder, 2=Video, 3=Audio, 4=Text, 5=Image
   */
  type?: number;
}

export interface StorageDetails {
  /**
   * Storage driver name
   */
  driver_name?: string;
  /**
   * Free storage space in bytes
   */
  free_space?: number;
  /**
   * Total storage space in bytes
   */
  total_space?: number;
}


/**
 * FsGetResponse
 */
export interface FsGetResponse {
  /**
   * Creation time
   */
  created?: Date;
  /**
   * Parsed hash information
   */
  hash_info?: { [key: string]: string } | null;
  /**
   * Hash information (JSON string or "null")
   */
  hashinfo?: string;
  /**
   * Object ID (may be empty for local storage)
   */
  id?: string;
  /**
   * Whether this is a directory
   */
  is_dir?: boolean;
  /**
   * Last modified time
   */
  modified?: string;
  mount_details?: null | StorageDetails;
  /**
   * File or directory name
   */
  name?: string;
  /**
   * Full system path
   */
  path?: string;
  /**
   * Signature for download authentication
   */
  sign?: string;
  /**
   * File size in bytes (0 for directories)
   */
  size?: number;
  /**
   * Thumbnail URL (if available)
   */
  thumb?: string;
  /**
   * File type:
   * 0=Unknown, 1=Folder, 2=Video, 3=Audio, 4=Text, 5=Image
   */
  type?: number;
}

export interface StorageDetails {
  /**
   * Storage driver name
   */
  driver_name?: string;
  /**
   * Free storage space in bytes
   */
  free_space?: number;
  /**
   * Total storage space in bytes
   */
  total_space?: number;
}
