import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'public-assets';

/**
 * Faz o upload de um arquivo para o Supabase Storage e retorna a URL pública.
 * @param file O arquivo a ser enviado (File object).
 * @param folder A subpasta dentro do bucket (ex: 'logos', 'banners').
 * @returns A URL pública do arquivo.
 */
export const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
  if (!file) {
    throw new Error("Nenhum arquivo fornecido.");
  }

  // Gera um nome de arquivo único para evitar colisões
  const fileExtension = file.name.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
  }

  // Obtém a URL pública
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};