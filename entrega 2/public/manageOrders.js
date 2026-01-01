document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  const res = await fetch('/api/orders', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const orders = await res.json();
  const ordersList = document.getElementById('ordersList');
  orders.forEach(order => {
    const orderDiv = document.createElement('div');
    orderDiv.innerHTML = `
      <h3>Pedido #${order._id}</h3>
      <p>Estado: ${order.status}</p>
      <p>Total: $${order.total}</p>
    `;
    ordersList.appendChild(orderDiv);
  });
});
