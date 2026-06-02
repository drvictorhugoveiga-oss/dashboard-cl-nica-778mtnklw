// @deps pdf-lib@1.17.1
routerAdd(
  'POST',
  '/backend/v1/export-pdf',
  async (e) => {
    try {
      const { PDFDocument, rgb, StandardFonts } = require('pdf-lib')
      const body = e.requestInfo().body || {}
      const { title, dateRange, view, summary, tableData } = body

      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      let page = pdfDoc.addPage([595.28, 841.89]) // A4
      let y = 800

      const drawText = (text, size, x, fontToUse, color = rgb(0, 0, 0)) => {
        if (text === null || text === undefined) text = ''
        page.drawText(String(text), { x, y, size, font: fontToUse, color })
      }

      drawText(title || 'Relatório Financeiro', 20, 50, boldFont)
      y -= 30
      drawText(`Período: ${dateRange || 'N/A'}`, 12, 50, font)
      y -= 20
      drawText(`Visão: ${view === 'monthly' ? 'Por Mês' : 'Geral'}`, 12, 50, font)
      y -= 40

      if (summary) {
        drawText('Resumo:', 14, 50, boldFont)
        y -= 20
        drawText(`Total Ganhos: ${summary.gains}`, 12, 50, font, rgb(0.13, 0.77, 0.36))
        y -= 15
        drawText(`Total Gastos: ${summary.losses}`, 12, 50, font, rgb(0.93, 0.26, 0.27))
        y -= 15
        drawText(
          `Lucro Líquido: ${summary.net}`,
          12,
          50,
          font,
          summary.net.startsWith('-') ? rgb(0.93, 0.26, 0.27) : rgb(0.13, 0.77, 0.36),
        )
        y -= 40
      }

      if (tableData && tableData.headers && tableData.rows) {
        drawText('Detalhamento:', 14, 50, boldFont)
        y -= 20

        const startX = 50
        const usableWidth = 595.28 - 100
        const colWidth = usableWidth / tableData.headers.length

        tableData.headers.forEach((h, i) => {
          drawText(h, 10, startX + i * colWidth, boldFont)
        })
        y -= 15
        page.drawLine({
          start: { x: startX, y: y + 5 },
          end: { x: startX + usableWidth, y: y + 5 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        })
        y -= 15

        for (const row of tableData.rows) {
          if (y < 50) {
            page = pdfDoc.addPage([595.28, 841.89])
            y = 800
          }
          row.forEach((cell, i) => {
            let text = String(cell)
            if (text.length > 25) text = text.substring(0, 22) + '...'

            let color = rgb(0, 0, 0)
            if (i > 0 && text.includes('R$')) {
              if (text.startsWith('-') || text.includes('-R$')) color = rgb(0.93, 0.26, 0.27)
              else color = rgb(0.13, 0.77, 0.36)
            }

            drawText(text, 10, startX + i * colWidth, font, color)
          })
          y -= 15
          page.drawLine({
            start: { x: startX, y: y + 5 },
            end: { x: startX + usableWidth, y: y + 5 },
            thickness: 0.5,
            color: rgb(0.9, 0.9, 0.9),
          })
          y -= 5
        }
      }

      const pdfBytes = await pdfDoc.save()
      return e.blob(200, 'application/pdf', pdfBytes)
    } catch (err) {
      $app.logger().error('Error generating PDF:', 'error', err.message)
      return e.internalServerError('Falha ao gerar PDF')
    }
  },
  $apis.requireAuth(),
)
