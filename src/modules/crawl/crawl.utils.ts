import Excel from 'exceljs';

const options = {
  filename: './nft-urls.xlsx',
  useStyles: true,
  useSharedStrings: true,
};

const workbook = new Excel.stream.xlsx.WorkbookWriter(options);

export const exportToExcel = (excelData: string[]) => {
  const worksheet = workbook.addWorksheet('Urls');
  worksheet.columns = [{ header: 'Url', key: 'url' }];

  excelData.forEach((row: string) => {
    worksheet
      .addRow({
        url: row,
      })
      .commit();
  });

  workbook.commit().then(function () {
    console.log('Excel file created');
  });
};
export const cssSelector = 'a.h-full';
export const amountSelector = 'span.text-sm.text-primary';
export const MAX = 10;
