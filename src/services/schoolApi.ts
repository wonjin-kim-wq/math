export interface SearchedSchool {
  id: string;
  name: string;
  region: string;
  address: string;
}

const NEIS_API_KEY = import.meta.env.VITE_NEIS_API_KEY || '8104c5762a1140e6aee29b0ce55c2921';

export const mapLctnToRegion = (lctn: string): string => {
  if (!lctn) return '기타';
  if (lctn.includes('서울')) return '서울';
  if (lctn.includes('부산')) return '부산';
  if (lctn.includes('대구')) return '대구';
  if (lctn.includes('인천')) return '인천';
  if (lctn.includes('광주')) return '광주';
  if (lctn.includes('대전')) return '대전';
  if (lctn.includes('울산')) return '울산';
  if (lctn.includes('세종')) return '세종';
  if (lctn.includes('경기')) return '경기';
  if (lctn.includes('강원')) return '강원';
  if (lctn.includes('충청북도') || lctn.includes('충북') || lctn.includes('충청북')) return '충북';
  if (lctn.includes('충청남도') || lctn.includes('충남') || lctn.includes('충청남')) return '충남';
  if (lctn.includes('전라북도') || lctn.includes('전북') || lctn.includes('전라북')) return '전북';
  if (lctn.includes('전라남도') || lctn.includes('전남') || lctn.includes('전라남')) return '전남';
  if (lctn.includes('경상북도') || lctn.includes('경북') || lctn.includes('경상북')) return '경북';
  if (lctn.includes('경상남도') || lctn.includes('경남') || lctn.includes('경상남')) return '경남';
  if (lctn.includes('제주')) return '제주';
  return '기타';
};

export async function searchSchools(keyword: string): Promise<SearchedSchool[]> {
  const cleanKeyword = keyword.trim();
  if (!cleanKeyword) return [];

  const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${NEIS_API_KEY}&Type=json&pIndex=1&pSize=50&SCHUL_KND_SC_NM=${encodeURIComponent('초등학교')}&SCHUL_NM=${encodeURIComponent(cleanKeyword)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
      return []; // No data found
    }

    if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
      const rows = data.schoolInfo[1].row;
      return rows.map((row: any) => ({
        id: `school_neis_${row.SD_SCHUL_CODE}`,
        name: row.SCHUL_NM,
        region: mapLctnToRegion(row.LCTN_SC_NM),
        address: row.ORG_RDNMA,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch schools from NEIS OpenAPI:', error);
  }
  return [];
}
