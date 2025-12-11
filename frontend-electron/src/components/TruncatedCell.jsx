/**
 * Componente para celdas de tabla con texto truncado y tooltip
 * @param {string} content - El contenido a mostrar
 * @param {number} maxLength - Longitud máxima antes de truncar (default: 30)
 * @param {string} className - Clases CSS adicionales
 */
export default function TruncatedCell({ content, maxLength = 30, className = '' }) {
  // Si el contenido es nulo o undefined, mostrar '-'
  if (!content && content !== 0) {
    return <span className={className}>-</span>;
  }

  // Convertir a string
  const text = String(content);
  
  // Determinar si necesita truncarse
  const needsTruncation = text.length > maxLength;
  const displayText = needsTruncation ? `${text.slice(0, maxLength)}...` : text;

  return (
    <span 
      className={className}
      title={needsTruncation ? text : undefined}
    >
      {displayText}
    </span>
  );
}
