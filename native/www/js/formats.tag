<formatpos>
	{formattedPos}

	<script>
		this.formattedPos = window.pos2text(opts.lat, opts.lon);
	</script>
</formatpos>

<formatdate>
	{formattedDate}

	<script>
		formatDate = function(ts) {
			var dat = new Date(ts);
   			// return dat.getDate()+"."+(dat.getMonth()+1)+"."+dat.getFullYear();
   			if (opts.format == "short") {
   				return dat.parse;
   			} else {
   				return dat.toLocaleDateString() + ", " + dat.toLocaleTimeString();
   			}

		}
		this.formattedDate = formatDate(opts.timestamp);
	</script>
</formatdate>