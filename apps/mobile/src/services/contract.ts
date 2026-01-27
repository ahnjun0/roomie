import { api } from './api';
import { ENDPOINTS } from '../constants/api';

export interface Contract {
  id: string;
  chatRoomId: string;
  userAId: string;
  userBId: string;
  status: 'DRAFT' | 'SIGNED';
  contractData: Record<string, any>;
  signatureA: boolean;
  signatureB: boolean;
  signedAt: string | null;
}

export async function getContractByChatRoom(chatRoomId: string): Promise<Contract> {
  return api.get<Contract>(ENDPOINTS.CONTRACTS.BY_CHAT_ROOM(chatRoomId));
}

export async function initContract(chatRoomId: string): Promise<Contract> {
  return api.post<Contract>(ENDPOINTS.CONTRACTS.INIT, { chatRoomId });
}
